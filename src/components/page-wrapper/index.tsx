"use client";
import { HTMLMotionProps, motion } from "framer-motion";

const PageWrapper = (props: HTMLMotionProps<"div">) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      {...props}
    />
  );
};

export default PageWrapper;
