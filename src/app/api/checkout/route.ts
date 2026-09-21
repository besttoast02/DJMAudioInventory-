import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Helper to safely get the Org ID, usually from env or a single row
const ORG_ID = '61306565-9c0b-4ef8-bb6d-6bb9bd380a11';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      eventDate, 
      eventType, 
      guestCount, 
      setting, 
      services, 
      clientName, 
      clientPhone, 
      clientEmail, 
      notes, 
      cartItems 
    } = body;

    const fullNotes = `
Client Email: ${clientEmail}
Event Type: ${eventType}
Guest Count: ${guestCount}
Setting: ${setting}
Requested Services: ${services.join(', ')}

Client Notes: ${notes}
    `.trim();

    // 1. Create the Client
    const { data: clientData, error: clientError } = await supabaseAdmin
      .from('clients')
      .insert({
        organization_id: ORG_ID,
        client_type: 'individual',
        name: clientName,
      })
      .select()
      .single();

    if (clientError) {
      console.error('Supabase client insert error:', clientError);
      return NextResponse.json({ error: 'Failed to create client.' }, { status: 500 });
    }

    const clientId = clientData.id;

    // Create Client Contact
    await supabaseAdmin.from('client_contacts').insert({
      client_id: clientId,
      first_name: clientName.split(' ')[0] || '',
      last_name: clientName.split(' ').slice(1).join(' ') || '',
      email: clientEmail,
      phone: clientPhone,
      is_primary: true
    });

    // 2. Insert into event_requests
    const { data: requestData, error: requestError } = await supabaseAdmin
      .from('event_requests')
      .insert({
        organization_id: ORG_ID,
        client_id: clientId,
        request_source: 'website',
        event_type: eventType,
        target_date: eventDate,
        guest_count: parseInt(guestCount) || null,
        status: 'draft_request',
        notes: fullNotes,
      })
      .select()
      .single();

    if (requestError) {
      console.error('Supabase event request insert error:', requestError);
      return NextResponse.json({ error: 'Failed to create event request.' }, { status: 500 });
    }

    const requestId = requestData.id;

    // 3. Create Estimate and Version
    const { data: estimateData } = await supabaseAdmin
      .from('estimates')
      .insert({
        organization_id: ORG_ID,
        event_request_id: requestId,
        client_id: clientId
      })
      .select().single();
      
    if (estimateData) {
      const { data: versionData } = await supabaseAdmin
        .from('estimate_versions')
        .insert({
          estimate_id: estimateData.id,
          version_number: 1,
          status: 'draft',
          total_cents: 0
        })
        .select().single();

      // 4. Insert cart items into estimate_lines
      if (versionData && cartItems && cartItems.length > 0) {
        const linesToInsert = cartItems.map((item: Record<string, unknown>, idx: number) => ({
          estimate_version_id: versionData.id,
          item_name: item.name as string,
          quantity: (item.qty as number) || 1,
          rate_cents: (item.rate_cents as number) || 0,
          unit_price_cents: (item.rate_cents as number) || 0,
          line_total_cents: ((item.rate_cents as number) || 0) * ((item.qty as number) || 1),
          sort_order: idx
        }));

        await supabaseAdmin.from('estimate_lines').insert(linesToInsert);
      }
    }

    // (Phase 3/Notifications will be added here)

    return NextResponse.json({ success: true, requestId }, { status: 200 });

  } catch (err: unknown) {
    console.error('Checkout error:', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
  }
}
