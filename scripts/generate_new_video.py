import subprocess
import os

os.makedirs('assets/videos', exist_ok=True)

# Generate an ultra-high definition, multi-shot cinematic video with smooth pan/zoom and lighting crossfades
cmd = [
    'ffmpeg', '-y',
    '-loop', '1', '-t', '7', '-i', 'assets/images/hero_lounge.jpg',
    '-loop', '1', '-t', '7', '-i', 'assets/images/cupping_lab.jpg',
    '-loop', '1', '-t', '7', '-i', 'assets/images/terroir_harvest.jpg',
    '-filter_complex',
    '[0:v]scale=1920:1080,zoompan=z=\'min(zoom+0.0006,1.18)\':d=420:x=\'iw/2-(iw/zoom/2)\':y=\'ih/2-(ih/zoom/2)\':s=1920x1080,fps=60[v0];'
    '[1:v]scale=1920:1080,zoompan=z=\'min(zoom+0.0008,1.20)\':d=420:x=\'iw/2-(iw/zoom/2)\':y=\'ih/2-(ih/zoom/2)\':s=1920x1080,fps=60[v1];'
    '[2:v]scale=1920:1080,zoompan=z=\'min(zoom+0.0006,1.18)\':d=420:x=\'iw/2-(iw/zoom/2)\':y=\'ih/2-(ih/zoom/2)\':s=1920x1080,fps=60[v2];'
    '[v0][v1]xfade=transition=fadeblack:duration=1.2:offset=5.8[x1];'
    '[x1][v2]xfade=transition=fadeblack:duration=1.2:offset=10.4[outv]',
    '-map', '[outv]',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '17',
    '-pix_fmt', 'yuv420p',
    'assets/videos/atelier_masterpiece.mp4'
]

print("Generating new 60fps cinematic video...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("Return code:", res.returncode)
if res.returncode == 0:
    print("Video successfully generated at assets/videos/atelier_masterpiece.mp4")
