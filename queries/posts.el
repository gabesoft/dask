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
:base = http://localhost:8006
:content-type = application/json

# post creation
# successful first then conflict error subsequent times
POST :base/posts
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

# post creation - invalid
# successful first then conflict error subsequent times
POST :base/posts
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
PUT :base/posts/5677a14921a210927374a8de
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
PATCH :base/posts/5677a14921a210927374a8de
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
GET :base/posts/5677a14921a210927374a8de

# non existing post read 
GET :base/posts/5674dcc9f73a74423ae68b20

# invalid id post read 
GET :base/posts/abcd

# no id specified
GET :base/posts/

# post delete
# DELETE :base/posts/5677a14921a210927374a8de

# post bulk delete - invalid
DELETE :base/bulk/posts
Content-type: :content-type
[ "1", "2", "3" ]

# bulk post creation - non array input
POST :base/bulk/posts
Content-type: :content-type
{}

# bulk post creation
# successful first then conflict error subsequent times
POST :base/bulk/posts
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