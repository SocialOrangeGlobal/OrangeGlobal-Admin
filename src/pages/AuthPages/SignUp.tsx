import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="SignUp | Orange Global Admin Panel"
        description="This is the SignUp Tables page for the Orange Global Admin Panel."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
