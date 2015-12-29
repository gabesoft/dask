# -*- restclient -*-
# https://github.com/pashky/restclient.el
#
# C-c C-c: runs the query under the cursor, tries to pretty-print the response (if possible)
# C-c C-r: same, but doesn't do anything with the response, just shows the buffer
# C-c C-v: same as C-c C-c, but doesn't switch focus to other window
# C-c C-p: jump to the previous query
# C-c C-n: jump to the next query
# C-c C-.: mark the query under the cursor
# C-c C-u: copy query under the cursor as a curl command
#

# variables
:api = http://localhost:8006
:content-type = application/json

# get feed by uri
# successful first then conflict error subsequent times
POST :api/search/feeds
Content-type: :content-type
{
    "query": {
        "uri": "http:\/\/gitkitty.com\/feed.xml"
    }
}
