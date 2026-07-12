"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ANALYSIS_TYPES } from "@/lib/config/analysis-types";
import { CreateProjectSchema, type CreateProjectValues } from "@/lib/validation/project";

export function ProjectForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectValues>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: { analysisType: "A", background: "", priorityPoints: "", deadline: "", inputText: "" },
  });

  const onSubmit = async (values: CreateProjectValues) => {
    setServerError(null);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setServerError(data.error ?? "案件の作成に失敗しました。");
      return;
    }
    router.push(`/projects/${data.project.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="title">案件名</Label>
        <Input id="title" placeholder="例: 海外仕入先からの支払サイト短縮要請" {...register("title")} />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="analysisType">分析目的</Label>
        <Select id="analysisType" {...register("analysisType")}>
          {ANALYSIS_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label} — {t.description}
            </option>
          ))}
        </Select>
        {errors.analysisType && (
          <p className="mt-1 text-xs text-red-600">{errors.analysisType.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="background">前提・背景（任意）</Label>
        <Textarea id="background" rows={3} {...register("background")} />
      </div>

      <div>
        <Label htmlFor="priorityPoints">重視項目（任意）</Label>
        <Textarea id="priorityPoints" rows={2} placeholder="例: 資金繰りへの影響、取引継続性" {...register("priorityPoints")} />
      </div>

      <div>
        <Label htmlFor="deadline">期限（任意）</Label>
        <Input id="deadline" placeholder="例: 3週間以内に一次回答が必要" {...register("deadline")} />
      </div>

      <div>
        <Label htmlFor="inputText">テキスト直接入力（任意・資料は次の画面でアップロードできます）</Label>
        <Textarea
          id="inputText"
          rows={8}
          placeholder="メールの本文、議事録、メモなどをそのまま貼り付けられます。"
          {...register("inputText")}
        />
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "作成中..." : "案件を作成して次へ"}
      </Button>
    </form>
  );
}
