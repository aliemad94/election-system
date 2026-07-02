# ShortGPT — التثبيت اليدوي على Linux (Debian 11)

هذه الخطوات للمتقدمين فقط. الطريقة الموصى بها هي
Docker
أو
Google Colab.

## المتطلبات الدقيقة

- Python **3.10** تحديداً (ليس 3.11 أو أحدث)
- ffmpeg **4.2.3**
- نظام Debian 11 x64 أو ما يماثله

## ١. تثبيت اعتماديات النظام

```bash
sudo apt update && sudo apt upgrade
sudo apt install wget git libltdl-dev libjpeg-dev libpng-dev \
  libtiff-dev libgif-dev libfreetype6-dev liblcms2-dev libxml2-dev \
  build-essential libncursesw5-dev libssl-dev libsqlite3-dev tk-dev \
  libgdbm-dev libc6-dev libbz2-dev libffi-dev zlib1g-dev
```

## ٢. تثبيت Python 3.10.3 من المصدر

```bash
wget https://www.python.org/ftp/python/3.10.3/Python-3.10.3.tgz
tar xzf Python-3.10.3.tgz
cd Python-3.10.3
./configure --enable-optimizations
make install

# التحقق
python3.10 -V
```

## ٣. تثبيت المشروع

```bash
git clone https://github.com/RayVentura/ShortGPT.git
cd ShortGPT
pip3.10 install -r requirements.txt
```

## ٤. متغيرات البيئة

```bash
export OPENAI_API_KEY="sk-..."
export PEXELS_API_KEY="..."
# اختياري:
export ELEVENLABS_API_KEY="..."
export GEMINI_API_KEY="..."
```

## ٥. التشغيل

```bash
python3.10 runShortGPT.py
# الواجهة تفتح على http://localhost:31415
```

## قائمة requirements.txt الكاملة

```
python-dotenv
gradio_client==1.5.4
gradio==5.12.0
openai==1.37.0
httpx==0.27.2
tiktoken
tinydb
tinymongo
proglog
yt-dlp>=2025.1.12
torch
torchaudio
whisper-timestamped
protobuf==3.20.3
pillow==10.4.0
moviepy==2.1.2
progress
questionary
edge-tts
```
