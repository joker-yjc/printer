import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const components: Components = {
    h1: ({ children }) => (
      <h1 style={{ fontSize: 26, fontWeight: 600, margin: '24px 0 16px', color: '#1f1f1f', borderBottom: '1px solid #e8e8e8', paddingBottom: 8 }}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 style={{ fontSize: 20, fontWeight: 600, margin: '24px 0 12px', color: '#1f1f1f' }}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ fontSize: 16, fontWeight: 600, margin: '20px 0 8px', color: '#1f1f1f' }}>
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p style={{ margin: '8px 0', lineHeight: 1.8, color: '#434343' }}>
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul style={{ margin: '8px 0', paddingLeft: 24, color: '#434343' }}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol style={{ margin: '8px 0', paddingLeft: 24, color: '#434343' }}>
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li style={{ margin: '4px 0', lineHeight: 1.8 }}>
        {children}
      </li>
    ),
    code: ({ className, children }) => {
      const isBlock = className?.startsWith('language-');
      if (isBlock) {
        return (
          <pre style={{
            background: '#f5f5f5',
            padding: '12px 16px',
            borderRadius: 6,
            overflow: 'auto',
            margin: '12px 0',
            fontSize: 13,
            border: '1px solid #e8e8e8',
          }}>
            <code className={className} style={{ color: '#1f1f1f' }}>{children}</code>
          </pre>
        );
      }
      return (
        <code style={{
          background: '#f0f0f0',
          padding: '2px 6px',
          borderRadius: 3,
          fontSize: '0.9em',
          color: '#d4380d',
          fontFamily: 'Monaco, Consolas, monospace',
        }}>
          {children}
        </code>
      );
    },
    table: ({ children }) => (
      <div style={{ overflow: 'auto', margin: '12px 0' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 14,
        }}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead style={{ background: '#fafafa' }}>{children}</thead>
    ),
    th: ({ children }) => (
      <th style={{
        padding: '10px 12px',
        border: '1px solid #e8e8e8',
        textAlign: 'left',
        fontWeight: 600,
        color: '#1f1f1f',
      }}>
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td style={{
        padding: '8px 12px',
        border: '1px solid #e8e8e8',
        color: '#434343',
      }}>
        {children}
      </td>
    ),
    img: ({ src, alt }) => {
      // 相对路径拼接 BASE_URL，确保部署到子路径时图片可正常加载
      const resolvedSrc = src?.startsWith('/')
        ? `${import.meta.env.BASE_URL}${src.slice(1)}`
        : src;
      return (
        <figure style={{ margin: '16px 0', textAlign: 'center' }}>
          <img
            src={resolvedSrc}
            alt={alt || ''}
            style={{
              maxWidth: '100%',
              borderRadius: 6,
              border: '1px solid #e8e8e8',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          />
          {alt && (
            <figcaption style={{ fontSize: 13, color: '#8c8c8c', marginTop: 8 }}>
              {alt}
            </figcaption>
          )}
        </figure>
      );
    },
    blockquote: ({ children }) => (
      <blockquote style={{
        borderLeft: '4px solid #1677ff',
        background: '#f0f7ff',
        padding: '12px 16px',
        margin: '12px 0',
        borderRadius: '0 4px 4px 0',
        color: '#1d39c4',
      }}>
        {children}
      </blockquote>
    ),
    hr: () => (
      <hr style={{ border: 'none', borderTop: '1px solid #e8e8e8', margin: '24px 0' }} />
    ),
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
