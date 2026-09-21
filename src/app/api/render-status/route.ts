import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Try to retrieve Render API key from client header or fallback to environment variables
  const apiKey = request.headers.get("x-render-api-key") || process.env.RENDER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Render API key not provided. Please supply it in the header or set RENDER_API_KEY on the server." },
      { status: 401 }
    );
  }

  try {
    // 1. Fetch all services
    const servicesResponse = await fetch("https://api.render.com/v1/services?limit=50", {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      next: { revalidate: 10 } // short cache
    });

    if (!servicesResponse.ok) {
      const errorMsg = await servicesResponse.text();
      return NextResponse.json(
        { error: `Render API Error: ${servicesResponse.status} - ${errorMsg}` },
        { status: servicesResponse.status }
      );
    }

    const servicesData = await servicesResponse.json();

    // 2. Fetch the latest deploy status for each service in parallel
    const servicesWithDeploys = await Promise.all(
      servicesData.map(async (item: any) => {
        const service = item.service;
        try {
          const deployResponse = await fetch(`https://api.render.com/v1/services/${service.id}/deploys?limit=1`, {
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${apiKey}`,
            },
            next: { revalidate: 10 }
          });

          if (deployResponse.ok) {
            const deploys = await deployResponse.json();
            const latestDeploy = deploys.length > 0 ? deploys[0] : null;
            return {
              id: service.id,
              name: service.name,
              type: service.type,
              repo: service.repo,
              branch: service.branch,
              updatedAt: service.updatedAt,
              dashboardUrl: service.dashboardUrl,
              latestDeploy: latestDeploy ? latestDeploy.deploy : null // Render list deploys has { deploy: {...} } structure
            };
          }
        } catch (err) {
          console.error(`Failed to fetch deploy for service ${service.id}:`, err);
        }

        return {
          id: service.id,
          name: service.name,
          type: service.type,
          repo: service.repo,
          branch: service.branch,
          updatedAt: service.updatedAt,
          dashboardUrl: service.dashboardUrl,
          latestDeploy: null
        };
      })
    );

    return NextResponse.json({ services: servicesWithDeploys });
  } catch (error: any) {
    console.error("Render status proxy error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch deployment status" }, { status: 500 });
  }
}
