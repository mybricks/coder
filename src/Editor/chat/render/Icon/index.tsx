import React, { CSSProperties, useMemo } from "react";
import styles from "./index.module.less";

const icons = {
  close: (
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="3185"
      width="64"
      height="64"
    >
      <path
        d="M512 128C300.8 128 128 300.8 128 512s172.8 384 384 384 384-172.8 384-384S723.2 128 512 128zM672 627.2c12.8 12.8 12.8 32 0 44.8s-32 12.8-44.8 0L512 556.8l-115.2 115.2c-12.8 12.8-32 12.8-44.8 0s-12.8-32 0-44.8L467.2 512 352 396.8C339.2 384 339.2 364.8 352 352s32-12.8 44.8 0L512 467.2l115.2-115.2c12.8-12.8 32-12.8 44.8 0s12.8 32 0 44.8L556.8 512 672 627.2z"
        p-id="3186"
        fill="#8a8a8a"
      ></path>
    </svg>
  ),
  copy: (
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="10261"
      width="32"
      height="32"
    >
      <path
        d="M440.799602 952.640634c-86.282305 0-156.42792-70.149614-156.42792-156.42892V426.415551c0-86.282305 70.149614-156.479909 156.42792-156.479909h369.847152c86.282305 0 156.42792 70.200603 156.42792 156.479909v369.796163c0 86.282305-70.149614 156.42892-156.42792 156.42892z m-71.071425-526.225083v369.796163a71.152408 71.152408 0 0 0 71.071425 71.122415h369.847152a71.163406 71.163406 0 0 0 71.122414-71.122415V426.415551a71.196399 71.196399 0 0 0-71.122414-71.122414H440.799602a71.185401 71.185401 0 0 0-71.071425 71.122414zM56.769358 582.843472V198.813228c0-86.228316 70.149614-156.42892 156.479909-156.42892h384.030244c78.444913 0 142.244829 63.748926 142.244829 142.193839a42.678248 42.678248 0 1 1-85.357495 0 56.959319 56.959319 0 0 0-56.888334-56.888333H213.249267a71.229392 71.229392 0 0 0-71.122414 71.122414v384.031244a56.893332 56.893332 0 0 0 56.888333 56.888333 42.678248 42.678248 0 1 1 0 85.357495c-78.445912 0-142.245828-63.800916-142.245828-142.245828z"
        p-id="10262"
        fill="#fff"
      ></path>
    </svg>
  ),
  success: (
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="2321"
      width="32"
      height="32"
    >
      <path
        d="M512 149.333c200.299 0 362.667 162.368 362.667 362.667S712.299 874.667 512 874.667 149.333 712.299 149.333 512 311.701 149.333 512 149.333z m0 64c-164.95 0-298.667 133.718-298.667 298.667S347.051 810.667 512 810.667 810.667 676.949 810.667 512 676.949 213.333 512 213.333z m169.045 127.04l45.91 44.587-271.83 279.723L318.293 522.73l46.08-44.416 90.944 94.336 225.728-232.278z"
        p-id="2322"
        fill="#1afa29"
      ></path>
    </svg>
  ),
  refresh: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2.3"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      ></path>
    </svg>
  ),
  accept: (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2.3"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
    </svg>
  ),
  reject: (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2.3"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
    </svg>
  ),
  speak: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2.3"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
      ></path>
    </svg>
  ),
};

export default ({
  name,
  className,
  style,
  onClick,
  tooltip,
  ...props
}: {
  name: keyof typeof icons;
  tooltip?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  [k: string]: any;
}) => {
  const attributes = useMemo(() => {
    const attrs: Record<string, any> = {};
    if (tooltip) {
      attrs["data-coder-tooltip"] = tooltip;
    }
    return attrs;
  }, [tooltip]);
  return (
    <span
      style={style}
      className={`${styles["coder-chat-icon"]} ${className ?? ""}`}
      onClick={onClick}
      {...attributes}
      {...props}
    >
      {icons[name]}
    </span>
  );
};
