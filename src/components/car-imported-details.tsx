export const CarImportedDetails = ({ features, rentalConditions }: { features: string[]; rentalConditions: string[] }) => {
  if (!features.length && !rentalConditions.length) return null;
  return (
    <section className="detail-section">
      <div className="detail-section-head">
        <div><p className="eyebrow">Дополнительные параметры</p><h2>Комплектация и тарифы</h2></div>
        <p>Основные характеристики и доступные тарифы собраны в одной карточке.</p>
      </div>
      <div className="spec-grid">
        {features.map((item, index) => <div className="spec" key={`feature-${index}`}><span>Характеристика</span><strong>{item}</strong></div>)}
        {rentalConditions.map((item, index) => <div className="spec" key={`tariff-${index}`}><span>Тариф</span><strong>{item}</strong></div>)}
      </div>
    </section>
  );
};
