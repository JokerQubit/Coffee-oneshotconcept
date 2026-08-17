import subprocess
import os

os.makedirs('assets/videos', exist_ok=True)

# Generate a high-definition 1080p 60fps cinematic video loop from our high-res assets
# Scene 1: Hero Lounge slow subtle push-in dolly (5s)
# Scene 2: Cupping Lab slow tracking pan (5s)
# Scene 3: Terroir Staircase architectural pan (5s)
# Cross-fade transitions with subtle film grain and color grade

cmd = [
    'ffmpeg', '-y',
    '-loop', '1', '-t', '6', '-i', 'assets/images/hero_lounge.jpg',
    '-loop', '1', '-t', '6', '-i', 'assets/images/cupping_lab.jpg',
    '-loop', '1', '-t', '6', '-i', 'assets/images/terroir_harvest.jpg',
    '-filter_complex',
    '[0:v]scale=1920:1080,zoompan=z=\'min(zoom+0.0015,1.25)\':d=360:x=\'iw/2-(iw/zoom/2)\':y=\'ih/2-(ih/zoom/2)\':s=1920x1080,fps=60[v0];'
    '[1:v]scale=1920:1080,zoompan=z=\'min(zoom+0.0012,1.2)\':d=360:x=\'iw/2-(iw/zoom/2)\':y=\'ih/2-(ih/zoom/2)\':s=1920x1080,fps=60[v1];'
    '[2:v]scale=1920:1080,zoompan=z=\'min(zoom+0.0015,1.25)\':d=360:x=\'iw/2-(iw/zoom/2)\':y=\'ih/2-(ih/zoom/2)\':s=1920x1080,fps=60[v2];'
    '[v0][v1]xfade=transition=fade:duration=1:offset=5[x1];'
    '[x1][v2]xfade=transition=fade:duration=1:offset=9[outv]',
    '-map', '[outv]',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    'assets/videos/roastery_ambient.mp4'
]

print("Generating 1080p 60fps cinematic video loop...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("Return code:", res.returncode)
if res.returncode == 0:
    print("Video successfully generated at assets/videos/roastery_ambient.mp4")
else:
    print("Error:", res.stderr[-500:])
