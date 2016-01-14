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

# get feeds by id
POST :api/search/feeds
Content-type: :content-type
{
    "query": {
        "_id": {
            "$in": [
                "563aec31d9ccd0b9cf91b80f",
                "563aec32d9ccd0b9cf91b8d6",
                "563aec32d9ccd0b9cf91b8eb",
                "563aec33d9ccd0b9cf91b9dc",
                "563aec33d9ccd0b9cf91b9f5",
                "563aec33d9ccd0b9cf91ba06",
                "563aec34d9ccd0b9cf91bad8",
                "563aec34d9ccd0b9cf91baed",
                "563aec3fd9ccd0b9cf91c752"
            ]
        }
    },
    "fields": "title"
}


# delete feed
DELETE :api/feeds/563aec53d9ccd0b9cf91dc4a
