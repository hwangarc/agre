import Head from 'next/head';
import Footer from '../components/Footer';
import { GraphQLClient, gql } from 'graphql-request';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const endpoint = process.env.GRAPHQL_ENDPOINT as string;
  const graphQLClient = new GraphQLClient(endpoint);
  const referringURL = ctx.req.headers?.referer || null;
  const path = ctx.req.url; // Sử dụng giá trị đầy đủ của URL hiện tại

  const fbclid = ctx.query.fbclid;

  // Kiểm tra nếu referer là Facebook hoặc yêu cầu có chứa fbclid
  if (referringURL?.includes('facebook.com') || fbclid) {
    return {
      redirect: {
        permanent: false,
        destination: path, // Chuyển hướng đến URL đầy đủ hiện tại
      },
    };
  }

  const query = gql`
    {
      post(id: "/${path}/", idType: URI) {
        id
        excerpt
        title
        link
        dateGmt
        modifiedGmt
        content
        author {
          node {
            name
          }
        }
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  `;

  const data = await graphQLClient.request(query);
  if (!data.post) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      path,
      post: data.post,
      host: ctx.req.headers.host,
    },
  };
};

interface PostProps {
  post: any;
  host: string;
  path: string;
}

const Post: React.FC<PostProps> = (props) => {
  const { post, host, path } = props;

  // to remove tags from excerpt
  const removeTags = (str: string) => {
    if (str === null || str === '') return '';
    else str = str.toString();
    return str.replace(/(<([^>]+)>)/gi, '').replace(/\[[^\]]*\]/, '');
  };

  return (
    <>
      <Head>
        <meta property="og:title" content={post.title} />
        <link rel="canonical" href={`https://${host}${path}`} />
        <meta property="og:description" content={removeTags(post.excerpt)} />
        <meta property="og:url" content={`https://${host}${path}`} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content={host.split('.')[0]} />
        <meta property="article:published_time" content={post.dateGmt} />
        <meta property="article:modified_time" content={post.modifiedGmt} />
        <meta property="og:image" content={post.featuredImage.node.sourceUrl} />
        <meta
          property="og:image:alt"
          content={post.featuredImage.node.altText || post.title}
        />
        <title>{post.title}</title>
      </Head>
      <div className="post-container">
        <h1>{post.title}</h1>
        <img
          src={post.featuredImage.node.sourceUrl}
          alt={post.featuredImage.node.altText || post.title}
        />
        <article dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </>
  );
};

export default Post;
