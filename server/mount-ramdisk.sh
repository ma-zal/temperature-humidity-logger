#!/bin/bash
BASEDIR=$(dirname "$0")

umount ${BASEDIR}/../client/tmp
sudo mkdir -p ${BASEDIR}/../client/tmp
sudo mount -t tmpfs -o size=10m tmpfs ${BASEDIR}/../client/tmp
