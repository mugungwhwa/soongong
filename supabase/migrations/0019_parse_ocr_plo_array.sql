-- SOO-59: parse-ocr Edge Function 호환 — detected_wrong_reason text → text[]
-- Edge Function이 Claude OCR 결과를 string[]로 반환하므로 컬럼 타입 승격.
-- 기존 데이터 보존: 단일 text값은 배열 원소 1개로 변환, NULL·빈 문자열은 빈 배열로.

alter table public.parsed_learning_objects
  alter column detected_wrong_reason type text[]
  using case
    when detected_wrong_reason is null or detected_wrong_reason = '' then '{}'::text[]
    else string_to_array(detected_wrong_reason, ',')
  end;

alter table public.parsed_learning_objects
  alter column detected_wrong_reason set default '{}';

alter table public.parsed_learning_objects
  alter column detected_wrong_reason set not null;
