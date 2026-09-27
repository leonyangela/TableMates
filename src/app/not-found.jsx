import WrapperComponent from "@/components/wrapper/wrapper.component";
import PageHeader from "@/components/ui/page-header.component";
import Button from "@/components/button/button.component";

export const metadata = {
  title: "Page not found | TableMates",
};

export default function NotFound() {
  return (
    <WrapperComponent>
      <PageHeader
        meta={["404"]}
        title="No table"
        muted="here."
        intro="The page you're looking for doesn't exist or has moved."
        actions={
          <>
            <Button href="/restaurants" arrow>
              Browse restaurants
            </Button>
            <Button href="/" variant="outline">
              Home
            </Button>
          </>
        }
      />
    </WrapperComponent>
  );
}
