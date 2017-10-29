#!/bin/sh

BASEDIR=$(dirname "$0")

# width overhead = 149px
GRAPH_WIDTH=400
GRAPH1_HEIGHT=220
GRAPH2_HEIGHT=220


export TZ='Europe/Prague'

rrdtool graph ${BASEDIR}/../client/tmp/graph-kuchyn.png \
--end now --start end-2d \
--width ${GRAPH_WIDTH} --height ${GRAPH1_HEIGHT} \
-c CANVAS#000000 -c FONT#FFFFFF -c BACK#000000 -c SHADEA#000000 -c SHADEB#000000 \
-c MGRID#cccccc -c GRID#888888 \
--title "KUCHYŇ - včera a dnes" \
--vertical-label "Teplota [°C]" \
--x-grid HOUR:6:HOUR:24:HOUR:12:0:"%a %H:%M" \
--lower-limit 10 \
--upper-limit 30 \
--y-grid 1:5 \
--right-axis-label 'Vlhkost [%]' \
--right-axis 5:-50 \
--right-axis-format %1.0lf \
DEF:temperature=${BASEDIR}/../rrd/sensor-in.rrd:temperature:AVERAGE \
'CDEF:count=temperature,UN,UNKN,COUNT,IF' \
'VDEF:last=count,MAXIMUM' \
\
DEF:humidity=${BASEDIR}/../rrd/sensor-in.rrd:humidity:AVERAGE \
CDEF:scaled_humidity=humidity,5,/ \
CDEF:scaled2_humidity=scaled_humidity,10,+ \
'GPRINT:humidity:LAST:Vlhkost\: %2.1lf %%' \
AREA:scaled2_humidity#4f4f88:"Vlhkost\j" \
\
'GPRINT:temperature:LAST:Teplota\: %2.1lf °C' \
LINE1:temperature#ffaa00:"Teplota\j" \
\
'GPRINT:last:Aktualizováno\: %H\:%M\:%S:strftime' \


rrdtool graph ${BASEDIR}/../client/tmp/graph-kuchyn-2.png \
--end now --start end-1m \
--width ${GRAPH_WIDTH} --height ${GRAPH2_HEIGHT} \
-c CANVAS#000000 -c FONT#FFFFFF -c BACK#000000 -c SHADEA#000000 -c SHADEB#000000 \
-c MGRID#cccccc -c GRID#888888 \
--title "KUCHYŇ - poslední měsíc" \
--vertical-label "Teplota [°C]" \
--x-grid DAY:1:WEEK:1:WEEK:1:0:"%d.%m." \
--lower-limit 10 \
--upper-limit 30 \
--y-grid 1:5 \
--right-axis-label 'Vlhkost [%]' \
--right-axis 5:-50 \
--right-axis-format %1.0lf \
--no-legend \
DEF:temperature=${BASEDIR}/../rrd/sensor-in.rrd:temperature:AVERAGE \
\
'CDEF:count=temperature,UN,UNKN,COUNT,IF' \
'VDEF:last=count,MAXIMUM' \
\
DEF:humidity=${BASEDIR}/../rrd/sensor-in.rrd:humidity:AVERAGE \
CDEF:scaled_humidity=humidity,5,/ \
CDEF:scaled2_humidity=scaled_humidity,10,+ \
AREA:scaled2_humidity#4f4f88:"Vlhkost\j" \
\
LINE1:temperature#ffaa00:"Teplota\j" \
\
'GPRINT:last:Aktualizovano\: %H\:%M\:%S:strftime' \


# -------------------------------------------------------------------------


rrdtool graph ${BASEDIR}/../client/tmp/graph-hlmistnost.png \
--end now --start end-2d \
--width ${GRAPH_WIDTH} --height ${GRAPH1_HEIGHT} \
-c CANVAS#000000 -c FONT#FFFFFF -c BACK#000000 -c SHADEA#000000 -c SHADEB#000000 \
-c MGRID#cccccc -c GRID#888888 \
--title "HL. MÍSTNOST - včera a dnes" \
--vertical-label "Teplota [°C]" \
--x-grid HOUR:6:HOUR:24:HOUR:12:0:"%a %H:%M" \
--lower-limit 10 \
--upper-limit 30 \
--y-grid 1:5 \
--right-axis-label 'Vlhkost [%]' \
--right-axis 5:-50 \
--right-axis-format %1.0lf \
DEF:temperature=${BASEDIR}/../rrd/sensor-out.rrd:temperature:AVERAGE \
'CDEF:count=temperature,UN,UNKN,COUNT,IF' \
'VDEF:last=count,MAXIMUM' \
\
DEF:humidity=${BASEDIR}/../rrd/sensor-out.rrd:humidity:AVERAGE \
CDEF:scaled_humidity=humidity,5,/ \
CDEF:scaled2_humidity=scaled_humidity,10,+ \
'GPRINT:humidity:LAST:Vlhkost\: %2.1lf %%' \
AREA:scaled2_humidity#4f4f88:"Vlhkost\j" \
\
'GPRINT:temperature:LAST:Teplota\: %2.1lf °C' \
LINE1:temperature#ffaa00:"Teplota\j" \
\
'GPRINT:last:Aktualizováno\: %H\:%M\:%S:strftime' \


rrdtool graph ${BASEDIR}/../client/tmp/graph-hlmistnost-2.png \
--end now --start end-1m \
--width ${GRAPH_WIDTH} --height ${GRAPH2_HEIGHT} \
-c CANVAS#000000 -c FONT#FFFFFF -c BACK#000000 -c SHADEA#000000 -c SHADEB#000000 \
-c MGRID#cccccc -c GRID#888888 \
--title "HL. MÍSTNOST - poslední měsíc" \
--vertical-label "Teplota [°C]" \
--x-grid DAY:1:WEEK:1:WEEK:1:0:"%d.%m." \
--lower-limit 10 \
--upper-limit 30 \
--y-grid 1:5 \
--right-axis-label 'Vlhkost [%]' \
--right-axis 5:-50 \
--right-axis-format %1.0lf \
--no-legend \
DEF:temperature=${BASEDIR}/../rrd/sensor-out.rrd:temperature:AVERAGE \
\
'CDEF:count=temperature,UN,UNKN,COUNT,IF' \
'VDEF:last=count,MAXIMUM' \
\
DEF:humidity=${BASEDIR}/../rrd/sensor-out.rrd:humidity:AVERAGE \
CDEF:scaled_humidity=humidity,5,/ \
CDEF:scaled2_humidity=scaled_humidity,10,+ \
AREA:scaled2_humidity#4f4f88:"Vlhkost\j" \
\
LINE1:temperature#ffaa00:"Teplota\j" \
\
'GPRINT:last:Aktualizovano\: %H\:%M\:%S:strftime' \
