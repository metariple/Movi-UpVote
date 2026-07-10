"use client";

import { useId } from "react";

export function TitleForm({
  name,
  kind,
  onNameChange,
  onKindChange,
  onSubmit,
  submitLabel,
  submittingLabel,
  submitting,
  extraActions,
}: {
  name: string;
  kind: "movie" | "series";
  onNameChange: (value: string) => void;
  onKindChange: (value: "movie" | "series") => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  submittingLabel: string;
  submitting: boolean;
  extraActions?: React.ReactNode;
}) {
  const nameId = useId();
  const kindId = useId();

  return (
    <form className="add-form" onSubmit={onSubmit}>
      <div className="field field-name">
        <label htmlFor={nameId}>Название</label>
        <input
          id={nameId}
          type="text"
          placeholder="Фильм или сериал…"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          maxLength={200}
        />
      </div>
      <div className="field field-kind">
        <label htmlFor={kindId}>Тип</label>
        <select id={kindId} value={kind} onChange={(e) => onKindChange(e.target.value as "movie" | "series")}>
          <option value="movie">фильм</option>
          <option value="series">сериал</option>
        </select>
      </div>
      <button className="btn btn-primary" type="submit" disabled={submitting || !name.trim()}>
        {submitting ? submittingLabel : submitLabel}
      </button>
      {extraActions}
    </form>
  );
}
