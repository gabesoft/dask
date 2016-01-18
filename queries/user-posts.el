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
:search-url = http://10.0.1.2:9200/.dev-dask-rss/post/_search?pretty
:content-type = application/json

# get by id
GET :api/user-posts/563aec31d9ccd0b9cf91b80a-5662bdff0eb8c31981983f54

# search via post 1
POST :api/search/user-posts
Content-type: :content-type
{
    "query": {
        "query": {
            "bool": {
                "must": [
                    {
                        "term": {
                            "userId": "5653f4c91eb8188e320236b3"
                        }
                    },
                    {
                        "term": {
                            "feedId": "5647fee0d50a855e89186651"
                        }
                    }
                ]
            }
        }
    },
    "limit": "5",
    "sort": [
        "post.date:desc"
    ]
}

# search via post 2
POST :api/search/user-posts
Content-type: :content-type
{
    "query": {
        "query": {
            "term": {
                "post.title": "vim"
            }
        }
    },
    "from": 5,
    "limit": 3,
    "sort": [
        "_score",
        "post.title:asc",
        "post.date:desc"
    ]
}

# search via post 3
POST :api/search/user-posts
Content-type: :content-type
{
    "sort": [
        "post.date:desc"
    ],
    "from": 0,
    "limit": 50,
    "query": {
        "query": {
            "bool": {
                "must": {
                    "term": {
                        "userId": "5653f4c91eb8188e320236b3"
                    }
                }
            }
        }
    }
}

# search post by feedId
POST :api/search/user-posts
Content-type: :content-type
{
    "query": {
        "query": {
            "term": {
                "feedId": "563aec38d9ccd0b9cf91c082"
            }
        }
    },
    "limit": 5
}

# search post by tags
POST :api/search/user-posts
Content-type: :content-type
{
    "query": {
        "query": {
            "match": {
                "tags": "self-improvement"
            }
        }
    },
    "limit": 5
}

# search via post 5 (TODO: try this)
POST :api/search/user-posts
Content-type: :content-type
{
    "limit": 5,
    "query": {
        "query": {
            "bool": {
                "should": [
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "read": false
                                    }
                                },
                                {
                                    "term": {
                                        "tags": "css"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "match": {
                            "post.title": "breaking news"
                        }
                    },
                    {
                        "match": {
                            "post.description": "breaking news"
                        }
                    }
                ]
            }
        }
    }
}

# search via post 6
POST :api/search/user-posts
Content-type: :content-type
{
    "sort": [
        "post.date:desc"
    ],
    "skip": 0,
    "limit": 50,
    "query": {
        "query": {
            "bool": {
                "must": [
                    {
                        "term": {
                            "userId": "5653f4c91eb8188e320236b3"
                        }
                    },
                    {
                        "bool": {
                            "should": [
                                {
                                    "term": {
                                        "feedId": "5689b39df4a00228071abed6"
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    }
}


# search by read status
POST :api/search/user-posts
Content-type: :content-type
{
    "query": {
        "query": {
            "term": {
                "read": false
            }
        }
    },
    "limit": 10,
    "fields": ["post.title", "post.author", "post.guid"]
}

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

# multiple term search 1
POST :search-url
Content-type: :content-type
{
    "filter": {
        "bool": {
            "must": {
                "term": { "tags": "css" }
            }
        }
    }
}

# multiple term search 3
POST :search-url
Content-type: :content-type
{
    "filter": {
        "bool": {
            "must": [
                {
                    "bool": { 
                        "should": [
                            { "term": { "post.title": "design" } },
                            { "term": { "post.description": "design" } }
                        ]
                     }
                },
                {
                    "bool": {
                        "must": [
                            {
                                "bool": {
                                    "should": [
                                        { "term": { "tags": "css" } }
                                    ]
                                }
                            },
                            {
                                "bool": {
                                    "should": [
                                        { "term": { "read": false } }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        }
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
        "bool": {
            "must": [
                {
                    "term": {
                        "read": false
                    }
                },
                {
                    "terms": {
                        "feedId": [ ]
                    }
                }
            ]
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

