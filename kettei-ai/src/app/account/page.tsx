import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPlan } from "@/lib/config/plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteAccountButton } from "@/components/account/delete-account-button";
import { formatDateTimeJst } from "@/lib/utils";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const plan = getPlan(user.plan);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">アカウント設定</h1>

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>表示名: {user.displayName || "（未設定）"}</p>
          <p>メールアドレス: {user.email}</p>
          <p>プラン: {plan.name}</p>
          <p>登録日: {formatDateTimeJst(user.createdAt)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>データとプライバシー</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>
            アップロードされた資料や分析結果には秘密情報が含まれる可能性があります。取り扱いには十分ご注意ください。
          </p>
          <p>
            AIによる出力は法務・税務・労務等の専門家判断を代替するものではありません。重要な意思決定の前に、必要に応じて専門家へご確認ください。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>退会</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>退会すると、アカウントに紐づくすべてのデータ（案件・資料・分析結果）が完全に削除されます。</p>
          <DeleteAccountButton />
        </CardContent>
      </Card>
    </div>
  );
}
