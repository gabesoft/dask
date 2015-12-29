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

# post creation
# successful first then conflict error subsequent times
POST :api/posts
Content-type: :content-type
{
    "author": "Anonymous",
    "date": "2015-05-12T00:00:00.000Z",
    "description": "Test description",
    "feedId": "563aec31d9ccd0b9cf91b804",
    "guid": "sample-post-10",
    "link": "http://sample-posts.com/sample-post-1",
    "pubdate": "2015-05-12T00:00:00.000Z",
    "tags": [ "javascript", "test" ],
    "title": "Test title"
}

# post creation - invalid
# successful first then conflict error subsequent times
POST :api/posts
Content-type: :content-type
{
    "author": "Anonymous",
    "date": "2015-05-12T00:00:00.000Z",
    "description": "Test description",
    "link": "http://sample-posts.com/sample-post-1",
    "pubdate": "2015-05-12T00:00:00.000Z",
    "tags": [ "javascript", "test" ],
    "title": "Test title"
}

# post replace
PUT :api/posts/5677a14921a210927374a8de
Content-type: :content-type
{
    "author": "Anonymous",
    "date": "2015-05-12T00:00:00.000Z",
    "feedId": "563aec31d9ccd0b9cf91b804",
    "guid": "sample-post-1",
    "link": "http://sample-posts.com/sample-post-1",
    "title": "I've been replaced"
}

# post update
PATCH :api/posts/5677a14921a210927374a8de
Content-type: :content-type
{
    "author": "Anonymous",
    "date": "2015-05-12T00:00:00.000Z",
    "description": "Test description",
    "feedId": "563aec31d9ccd0b9cf91b804",
    "guid": "sample-post-1",
    "link": "http://sample-posts.com/sample-post-1",
    "pubdate": "2015-05-12T00:00:00.000Z",
    "tags": [ "javascript", "test" ],
    "title": "Test title"
}

# existing post read 
GET :api/posts/5677a14921a210927374a8de

# non existing post read 
GET :api/posts/5674dcc9f73a74423ae68b20

# invalid id post read 
GET :api/posts/abcd

# no id specified
GET :api/posts/

# post delete
# DELETE :api/posts/5677a14921a210927374a8de

# post bulk delete - invalid
DELETE :api/bulk/posts
Content-type: :content-type
[ "1", "2", "3" ]

# bulk post creation - non array input
POST :api/bulk/posts
Content-type: :content-type
{}

# bulk post creation
# successful first then conflict error subsequent times
POST :api/bulk/posts
Content-type: :content-type
[{
    "author": "Anonymous",
    "date": "2015-05-12T00:00:00.000Z",
    "description": "Test description",
    "feedId": "563aec31d9ccd0b9cf91b804",
    "guid": "sample-post-9",
    "link": "http://sample-posts.com/sample-post-1",
    "pubdate": "2015-05-12T00:00:00.000Z",
    "tags": [ "javascript", "test" ],
    "title": "Test title"
}, {
    "author": "Anonymous",
    "date": "2015-05-12T00:00:00.000Z",
    "description": "Test description",
    "feedId": "563aec31d9ccd0b9cf91b804",
    "guid": "sample-post-3",
    "link": "http://sample-posts.com/sample-post-1",
    "pubdate": "2015-05-12T00:00:00.000Z",
    "tags": [ "javascript", "test" ],
    "title": "Test title"
}, {
    "author": "Anonymous",
    "date": "2015-05-12T00:00:00.000Z",
    "description": "Test description",
    "feedId": "563aec31d9ccd0b9cf91b804",
    "link": "http://sample-posts.com/sample-post-1",
    "pubdate": "2015-05-12T00:00:00.000Z",
    "tags": [ "javascript", "test" ],
    "title": "Test title"
}]

# search posts
POST :api/search/posts
Content-type: :content-type
{
  "query": { "feedId": "563aec31d9ccd0b9cf91b804" },
  "fields": "title feedId author",
  "limit": 5,
  "skip": 0
}
