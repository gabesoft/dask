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

# search by user
POST :api/search/feed-subscriptions
Content-type: :content-type
{
    "query": { "userId": "5653f4c91eb8188e320236b3" },
    "fields": "id"
}

# search by user 2
POST :api/search/feed-subscriptions
Content-type: :content-type
{
    "query": { "userId": "5653f4c91eb8188e320236b3" },
    "fields": "title"
}

# delete a subscription
DELETE :api/feed-subscriptions/5672dd1aa2f0405eb1a223f3