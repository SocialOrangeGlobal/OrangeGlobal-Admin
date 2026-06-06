import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="SignIn | Orange Global Admin Panel"
        description="This is the SignIn Tables page for the Orange Global Admin Panel."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
