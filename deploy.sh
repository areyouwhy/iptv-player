#!/bin/bash
# Build, package, install, and run on Samsung TV

# Add Tizen Studio tools to PATH
export PATH="$HOME/tizen-studio/tools/ide/bin:$HOME/tizen-studio/tools:$PATH"

TV=192.168.50.133:26101
cd ~/iptv-player && \
  rm -rf .buildResult && \
  tizen build-web -- . && \
  tizen package -t wgt -s IPTVProfile -- .buildResult && \
  sdb connect 192.168.50.133 && \
  tizen install -n ".buildResult/IPTVPlayer.wgt" --serial $TV && \
  tizen run -p iPlayerTV0.IPTVPlayer --serial $TV
