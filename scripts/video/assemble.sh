#!/bin/zsh
# Cuts the recorded segments and joins them into one 1440x900 MP4 (H.264, no audio).
# Usage: assemble.sh <work_dir> <out.mp4>
set -e
W=$1; OUT=$2
PAPER=0xF1F3EE
seg() { python3 -c "import json,sys;d={s['name']:s for s in json.load(open('$W/segments.json'))};s=d['$1'];print(s['$2'])"; }
enc=(-an -c:v libx264 -pix_fmt yuv420p -r 30 -preset medium -crf 20)
for n in 1a 2 3 5a 5b; do
  ffmpeg -y -loglevel error -ss $(seg $n start) -t $(seg $n duration) -i "$(seg $n video)" -vf "scale=1440:900,fps=30" $enc "$W/c_$n.mp4"
done
ffmpeg -y -loglevel error -ss $(seg 1b start) -t $(seg 1b duration) -i "$(seg 1b video)" \
  -vf "scale=-2:860,pad=1440:900:(ow-iw)/2:20:color=$PAPER,fps=30" $enc "$W/c_1b.mp4"
ffmpeg -y -loglevel error -ss $(seg 4L start) -t $(seg 4L duration) -i "$(seg 4L video)" \
  -ss $(seg 4R start) -t $(seg 4R duration) -i "$(seg 4R video)" \
  -filter_complex "[0:v]scale=720:900,fps=30[l];[1:v]scale=720:900,fps=30[r];[l][r]hstack=inputs=2" $enc "$W/c_4.mp4"
printf "file '%s'\n" $W/c_1a.mp4 $W/c_1b.mp4 $W/c_2.mp4 $W/c_3.mp4 $W/c_4.mp4 $W/c_5a.mp4 $W/c_5b.mp4 > "$W/list.txt"
ffmpeg -y -loglevel error -f concat -safe 0 -i "$W/list.txt" -c copy -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"
