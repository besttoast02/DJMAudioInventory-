import random
import math

bars = []
for i in range(64):
    # Create a spectral shape (higher in bass/mids, lower in highs, or some random peaks)
    # To make it look like music, we'll combine a base curve with random noise.
    x = i / 63.0
    # Base curve: highest around 0.2 (bass/kick), another peak around 0.6 (vocals/snare)
    base = 30 + 50 * math.exp(-((x - 0.15) ** 2) / 0.05) + 40 * math.exp(-((x - 0.6) ** 2) / 0.1)
    
    # Add randomness
    height = int(base + random.uniform(-20, 30))
    height = max(10, min(100, height)) # clamp between 10 and 100
    
    delay = round(random.uniform(0.1, 1.8), 2)
    bars.append(f'    <div class="eq-bar" style="--d: {delay}s; --h: {height}%"></div>')

print("\n".join(bars))
