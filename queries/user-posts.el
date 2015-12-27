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
:search-url = http://10.0.1.2:9200/.dev-dask-rss/post/_search?pretty
:content-type = application/json

# get by id
GET :base/user-posts/563aec31d9ccd0b9cf91b80a-5662bdff0eb8c31981983f54

# search by id
POST :search-url
Content-type: :content-type
{
    "query": {
        "term": {
            "_id": "563aec31d9ccd0b9cf91b80a-5662bdff0eb8c31981983f54"
        }
    }
}

# search by post id
POST :search-url
Content-type: :content-type
{
    "query": {
        "term": {
            "postId": "563aec31d9ccd0b9cf91b80a"
        }
    }
}

# multiple by id
POST :search-url
Content-type: :content-type
{
    "query": {
        "terms": {
            "_id": [
                "563aec40d9ccd0b9cf91c909-566333340eb8c31981983fd7",
                "563aec41d9ccd0b9cf91c9a3-566333340eb8c31981983fd7",
                "563aec3fd9ccd0b9cf91c795-566333450eb8c31981983fd8"
            ]
        }
    },
    "fields": [
        "feedId",
        "subscriptionId",
        "userId"
    ]
}


#
POST :search-url
Content-type: :content-type
{
    "query": {
        "term": { "post.title": "vim" }
    }
}

#
POST :search-url
Content-type: :content-type
{
    "query": {
        "term": { "post.title": "redis" }
    }
}

#
POST :search-url
Content-type: :content-type
{
    "filter": {
        "and": [
            { "term": { "tags": "meteor" } },
            { "term": { "read": false } }
        ]
    },
    "sort": {
        "post.date": "asc"
    }
}

#
POST :search-url
Content-type: :content-type
{
    "size": 170,
    "filter": {
        "and": [ { "term": { "read": false } } ]
    },
    "fields": [
        "feedId",
        "subscriptionId",
        "postId"
    ]
}

# unread count per feed
POST :search-url&search_type=count
Content-type: :content-type
{
    "size": 0,
    "query": {
        "term": {
            "read": false
        }
    },
    "aggs": {
        "posts_per_feed": {
            "terms": {
                "field": "feedId",
                "size": 0
            }
        }
    }
}

# count of all posts
GET :search-url&search_type=count&q=*

