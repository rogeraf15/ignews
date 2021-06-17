import { GetStaticProps } from "next"
import { useSession } from "next-auth/client"
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { RichText } from "prismic-dom";
import React, { useEffect } from "react";
import { getPrismicClient } from "../../../services/prismic";

import styles from '../post.module.scss';

type PostPreviewProps = {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  }
}

export default function PostPreview({ post }: PostPreviewProps){
  const [session] = useSession();
  const router = useRouter();

  useEffect(() => {
    if(session?.activeSubscription){
      router.push(`/posts/${post.slug}`)
    }
  },[session]);

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
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{__html: post.content}}
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">     
              <a>Subscribe now 🤗</a> 
            </Link>
          </div>
        </article>
      </main>
    </>
  )
}

// para paginas que tem parametro dinamico [slug], para colocar, alguma pagina especifica pronta
export const getStaticPaths = () => {
  return {
    //colocar quais paginas serao geradas estaticamente
    paths: [],
    //false -> se caso a pagina não foi criada estaticamente(primeira vez)
    //blocking -> para nao carregar todos os caminhos
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {})

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 3)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })  
  };

  return({ 
    props: { 
      post, 
    },
    revalidate: 60 * 30, //30 minutes
  })

}