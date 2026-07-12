import { z } from "zod";

export const LoginFormSchema = z.object({
  email: z.string().email("メールアドレスの形式が正しくありません。"),
  password: z.string().min(1, "パスワードを入力してください。"),
});
export type LoginFormValues = z.infer<typeof LoginFormSchema>;

export const SignupFormSchema = z.object({
  displayName: z.string().min(1, "表示名を入力してください。").max(100),
  email: z.string().email("メールアドレスの形式が正しくありません。"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください。"),
});
export type SignupFormValues = z.infer<typeof SignupFormSchema>;
