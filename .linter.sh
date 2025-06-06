#!/bin/bash
cd /home/kavia/workspace/code-generation/robotic-futuristix-34784-37c40cd4/robo_tic_futuristix
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

