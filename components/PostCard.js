import Link from "next/link"

export default function PostCard({ post }) {
  const truncatedContent = post.content.slice(0, 100) + "...";

  return (
    <Link href={post.uri}>
      <a className="card">
        {post.featuredImage && post.featuredImage.node.sourceUrl && (
          <div className="image-container">
            <img src={post.featuredImage.node.sourceUrl} alt="Feature Image" />
          </div>
        )}
        <h3>{post.title} &rarr;</h3>
        <p>{truncatedContent}</p>
      </a>
    </Link>
  )
}
