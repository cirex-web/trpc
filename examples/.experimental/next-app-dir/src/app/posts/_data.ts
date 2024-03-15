'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { addPostSchema, type Post } from './_data.schema';
import { dataLayer, protectedProcedure, publicProcedure } from './_trpc';

const posts: Post[] = [
  {
    id: '1',
    title: 'Hello world',
    content: 'This is a test post',
  },
  {
    id: '2',
    title: 'Second post',
    content: 'This is another test post',
  },
];
const db = {
  posts,
};

export const addPost = dataLayer.action(
  protectedProcedure.input(addPostSchema).mutation(async (opts) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const post: Post = {
      ...opts.input,
      id: `${Math.random()}`,
    };

    db.posts.push(post);
    revalidatePath('/');
    redirect(`/posts/${post.id}`);
  }),
);

export const listPosts = dataLayer.data(
  publicProcedure.query(() => {
    return db.posts;
  }),
);

export const postById = dataLayer.data(
  publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query((opts) => {
      return db.posts.find((post) => post.id === opts.input.id);
    }),
);