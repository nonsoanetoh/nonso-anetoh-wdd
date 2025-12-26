/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import * as prismic from "@prismicio/client";
import { createClient } from "@/prismicio";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Index() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const client = createClient();
      const fetchedPosts = await client.getAllByType("blog_post", {
        orderings: [
          { field: "my.blog_post.publication_date", direction: "desc" },
          { field: "document.first_publication_date", direction: "desc" },
        ],
      });
      setPosts(fetchedPosts);
    };
    fetchPosts();
  }, []);

  return (
    <section className="page page--journal">
      <div className="inner">
        <div className="header">
          <div className="title">All Posts</div>
          <p className="description">
            A collection of articles detailing my journey — ideas, experiments,
            and lessons learned while building projects.
          </p>
        </div>
        <ul className="posts">
          {posts.map((post) => (
            <li key={post.id}>
              <Link className="post" href={`/blog/${post.uid}`}>
                <article
                  className="post__face post__face--front"
                  style={{ backgroundColor: post.data.background_color }}
                >
                  <header className="front">
                    <h3 className="title">{prismic.asText(post.data.title)}</h3>
                  </header>
                  <div className="back">dsadsa</div>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
