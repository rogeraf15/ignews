import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"
import Head from "next/head";
import { RichText } from "prismic-dom";
import React from "react";
import { getPrismicClient } from "../../services/prismic";

import styles from './post.module.scss';

type PostProps = {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  }
}

export default function Post({ post }: PostProps){
  return(
    <>
      <Head>
        <title>{post.title} | Ignews</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          {/* colocar html pronto */}
          <div 
            className={styles.postContent}
            dangerouslySetInnerHTML={{__html: post.content}}
          />
        </article>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
  //para saber se o usuario esta logado
  const session = await getSession({ req });
  
  const { slug } = params;

  // se caso o usuario nao ter inscrição paga ele sera redirecionado para home
  if(!session?.activeSubscription){
    return {
      redirect: {
        destination: `/posts/preview/${slug}`,
        // permanent => que o usuario pode algum dia se inscrever
        permanent: false,
      }
    };
  }


  const prismic = getPrismicClient(req);

  const response = await prismic.getByUID('post', String(slug), {})

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  };

  return({ 
    props: { post }
  })

}