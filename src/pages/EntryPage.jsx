import Header from "../components/Header";
import ModelViewer from "../components/ModelViewer";

function EntryPage() {
  return (
    <main className="entry-page">
      <Header />

      <section className="hero" aria-labelledby="hero-title">
        <h1 className="hero-title" id="hero-title">
          HELLO WORLD
        </h1>

        <div className="model-stage" aria-label="회전 가능한 3D 상자">
          <ModelViewer />
        </div>

        <p className="interaction-hint">Hold &amp; Spin</p>
      </section>
    </main>
  );
}

export default EntryPage;
