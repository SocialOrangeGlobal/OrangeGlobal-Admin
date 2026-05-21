import { HelmetProvider, Helmet } from "react-helmet-async";

const PageMeta = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  const cleanTitle = title
    .replace(/TailAdmin/g, "Orange Global Admin")
    .replace(/React\.js Ecommerce Dashboard/g, "Dashboard");

  const cleanDescription = description
    .replace(/TailAdmin/g, "Orange Global Admin")
    .replace(/React\.js Ecommerce Dashboard/g, "Dashboard");

  return (
    <Helmet>
      <title>{cleanTitle}</title>
      <meta name="description" content={cleanDescription} />
    </Helmet>
  );
};

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;
