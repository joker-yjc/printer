import React, { useState, useEffect, useCallback } from 'react';
import { Spin } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MarkdownRenderer from './components/MarkdownRenderer';
import { chapters } from '../../help/chapters';
import styles from './index.module.css';

const Help: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 从 URL hash 获取当前章节 id
  const getChapterIdFromHash = () => {
    const hash = location.hash.replace('#', '');
    return hash || chapters[0].id;
  };

  const [activeChapterId, setActiveChapterId] = useState(getChapterIdFromHash);
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(true);

  // 加载 Markdown 内容
  const loadMarkdown = useCallback(async (chapterId: string) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    if (!chapter) return;

    setLoading(true);
    try {
      const response = await fetch(chapter.file);
      if (!response.ok) {
        setMarkdownContent(`# ${chapter.title}\n\n内容加载中...`);
      } else {
        const text = await response.text();
        setMarkdownContent(text);
      }
    } catch (err) {
      console.error('加载文档失败:', err);
      setMarkdownContent(`# ${chapter.title}\n\n文档加载失败，请稍后重试。`);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化和 hash 变化时加载内容
  useEffect(() => {
    const chapterId = getChapterIdFromHash();
    if (chapters.find((c) => c.id === chapterId)) {
      setActiveChapterId(chapterId);
    }
  }, [location.hash]);

  useEffect(() => {
    loadMarkdown(activeChapterId);
  }, [activeChapterId, loadMarkdown]);

  // 切换章节
  const handleSelectChapter = (chapterId: string) => {
    setActiveChapterId(chapterId);
    navigate(`/help#${chapterId}`, { replace: true });
    // 滚动到顶部
    document.querySelector(`.${styles['content-area']}`)?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles['help-page']}>
      <div className={styles['content-area']}>
        {loading ? (
          <div className={styles.loading}>
            <Spin size="large" />
          </div>
        ) : (
          <MarkdownRenderer content={markdownContent} />
        )}
      </div>
       <Sidebar activeChapterId={activeChapterId} onSelect={handleSelectChapter} />
    </div>
  );
};

export default Help;
