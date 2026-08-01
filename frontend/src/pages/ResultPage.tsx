import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Modal, ModalCloseButton } from "@/components/ui/Modal";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { AnalysisCharts } from "@/features/fortune/components/AnalysisCharts";
import { MeishikiTable } from "@/features/fortune/components/MeishikiTable";
import { useFortune } from "@/features/fortune/hooks/useFortune";
import { parseFortuneQuery } from "@/features/fortune/query";
import { useI18n } from "@/i18n";

/**
 * 鑑定結果ページ。条件はクエリ (?year=1990&month=1&day=1...) で受け取り、
 * このページ自身が鑑定する。再読み込み・URL 共有でも同じ結果になる。
 */
export function ResultPage() {
  const [params] = useSearchParams();
  const { result, loading, error, submit } = useFortune();
  // 結果を見たあとの導線。登録フォームはページ内のポップアップで出す。
  const [signupOpen, setSignupOpen] = useState(false);
  const { t } = useI18n();

  const request = useMemo(() => parseFortuneQuery(params), [params]);

  useEffect(() => {
    if (request) submit(request);
    // submit は毎レンダー作り直されるため、条件が変わったときだけ実行する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  return (
    <main>
      <div className="wrap-wide result-page">
        <div className="result-head">
          <h1>{t("fortune.resultTitle")}</h1>
          <p className="hint">{t("fortune.resultHint")}</p>
        </div>

        {!request && <p className="error">{t("fortune.missingParams")}</p>}
        {loading && <p className="hint result-status">{t("common.loading")}</p>}
        {error && <p className="error">{error}</p>}

        {result && (
          <section className="result-section">
            <MeishikiTable result={result} />

            {/* 古い API はチャートを返さないので、無い場合は命式だけ表示する */}
            {result.charts?.length ? (
              <div className="charts-section">
                <div className="result-head">
                  <h2>{t("fortune.chartsTitle")}</h2>
                  <p className="hint">{t("fortune.chartsHint")}</p>
                </div>
                <AnalysisCharts charts={result.charts} />
              </div>
            ) : null}
          </section>
        )}

        <p className="back-link">
          <button type="button" className="link-btn" onClick={() => setSignupOpen(true)}>
            {t("fortune.registerCta")}
          </button>
        </p>
      </div>

      {signupOpen && (
        <Modal
          onClose={() => setSignupOpen(false)}
          cardClassName="signup-modal-card"
          label={t("register.title")}
        >
          <ModalCloseButton onClose={() => setSignupOpen(false)} />
          <RegisterForm />
        </Modal>
      )}
    </main>
  );
}
