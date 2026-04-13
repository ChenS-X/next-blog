import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';

// Use a random-looking directory name to obfuscate the source markdown files
const POSTS_SUBDIR = 'posts_8f2a4c';
const postsDirectory = path.join(process.cwd(), 'public', POSTS_SUBDIR);

export interface PostData {
  slug: string; // This will now be the relative path, e.g., 'vue/my-post'
  category: string; // The parent folder name, or 'Uncategorized'
  title: string;
  date: string;
  description: string;
  headerImage: string;
  thumbnail: string;
  deleted?: boolean;
  sticky?: boolean;
  contentHtml?: string;
  hidden?: boolean; // 控制是否隐藏文章
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
}

export function getSortedPostsData(): PostData[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  
  const filePaths = getAllFiles(postsDirectory);
  
  const allPostsData = filePaths
    .filter((filePath) => filePath.endsWith('.md'))
    .map((filePath) => {
      // Get relative path from postsDirectory
      const relativePath = path.relative(postsDirectory, filePath);
      // Remove ".md" to get slug
      const slug = relativePath.replace(/\.md$/, '');
      
      // Determine category from directory structure
      const pathParts = slug.split(path.sep);
      const category = pathParts.length > 1 ? pathParts[0] : 'General';

      // Read markdown file as string
      const fileContents = fs.readFileSync(filePath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Combine the data with the slug and category
      return {
        slug,
        category,
        ...(matterResult.data as { 
          title: string; 
          date: string; 
          description: string; 
          headerImage: string; 
          thumbnail: string; 
          deleted?: boolean;
          sticky?: boolean;
          hidden?: boolean;
        }),
      };
    })
    .filter(post => !post.deleted && !post.hidden); // Filter out deleted and hidden posts

  // Sort posts by sticky status first, then by date
  return allPostsData.sort((a, b) => {
    if (a.sticky && !b.sticky) {
      return -1;
    }
    if (!a.sticky && b.sticky) {
      return 1;
    }
    // If both are sticky or both are not, sort by date
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getCategories(): string[] {
  const posts = getSortedPostsData();
  const categories = posts.map(post => post.category);
  return Array.from(new Set(categories));
}

export function getPostsByCategory(category: string): PostData[] {
  const posts = getSortedPostsData();
  return posts.filter(post => post.category.toLowerCase() === category.toLowerCase());
}

export async function getPostData(slugParts: string[]): Promise<PostData> {
  const slug = slugParts.join(path.sep);
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  if (matterResult.data.deleted) {
    throw new Error('Post not found');
  }

  if (matterResult.data.hidden) {
    throw new Error('Post no found')
  }

  // Use remark and rehype to convert markdown into HTML string with syntax highlighting
  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  const category = slugParts.length > 1 ? slugParts[0] : 'General';

  // Combine the data with the slug and contentHtml
  return {
    slug,
    category,
    contentHtml,
    ...(matterResult.data as { 
      title: string; 
      date: string; 
      description: string; 
      headerImage: string; 
      thumbnail: string; 
      deleted?: boolean;
      sticky?: boolean;
      hidden?: boolean;
    }),
  };
}

export function getAllPostSlugs() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  
  const filePaths = getAllFiles(postsDirectory);
  
  return filePaths
    .filter((filePath) => filePath.endsWith('.md'))
    .filter((filePath) => {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const matterResult = matter(fileContents);
      return !matterResult.data.deleted && !matterResult.data.hidden;
    })
    .map((filePath) => {
      const relativePath = path.relative(postsDirectory, filePath);
      const slug = relativePath.replace(/\.md$/, '');
      return {
        slug: slug.split(path.sep),
      };
    });
}
