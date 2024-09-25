import Markdown, { MarkdownToJSX } from 'markdown-to-jsx';
import React from 'react'

interface MarkdownRendererProps {
    content: string;
    className?: string;
  }
  
  const options: MarkdownToJSX.Options = {
    overrides: {
      p: {
        component: ({ children, ...props }: React.HTMLProps<HTMLParagraphElement>) => {
        
          const hasBlockChild = React.Children.toArray(children).some(
            (child) =>
              React.isValidElement(child) &&
              (child.type === "ul" || child.type === "div" || child.type === "ol")
          );
  
          if (hasBlockChild) {
            return <>{children}</>;
          }
  
          return <p {...props}>{children}</p>;
        },
      },
    },
  };
  
  const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content,className }) => {
    return <Markdown options={options} className={className}>{content}</Markdown>;
  };


export default MarkdownRenderer