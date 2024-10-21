import { ImageResponse } from "next/og";
import { getOneLesson } from "../__components/api";
import { convertMarkdownToHtml } from "@/state/md/parse";
const HtmlToReactParser = require("html-to-react").Parser;
// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "About Acme";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";
interface PageProps {
  params: { lesson: string };
}
// Image generation
export default async function Image({ params }: PageProps) {
  // Font
const item = await getOneLesson(params.lesson);

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 128,
          background: "linear-gradient(90deg, rgba(20,49,45,1) 29%, rgba(38,145,79,1) 90%)",
          color: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        {item?.title}
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
    }
  );
}
