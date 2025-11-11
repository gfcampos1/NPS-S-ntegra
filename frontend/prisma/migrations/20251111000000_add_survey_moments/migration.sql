-- CreateTable
CREATE TABLE "survey_moments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_moments_pkey" PRIMARY KEY ("id")
);

-- AddColumn
ALTER TABLE "forms" ADD COLUMN "surveyMomentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "survey_moments_slug_key" ON "survey_moments"("slug");

-- CreateIndex
CREATE INDEX "survey_moments_slug_idx" ON "survey_moments"("slug");

-- CreateIndex
CREATE INDEX "survey_moments_isActive_idx" ON "survey_moments"("isActive");

-- CreateIndex
CREATE INDEX "survey_moments_order_idx" ON "survey_moments"("order");

-- CreateIndex
CREATE INDEX "forms_surveyMomentId_idx" ON "forms"("surveyMomentId");

-- AddForeignKey
ALTER TABLE "forms" ADD CONSTRAINT "forms_surveyMomentId_fkey" FOREIGN KEY ("surveyMomentId") REFERENCES "survey_moments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Inserir Momentos Iniciais
INSERT INTO "survey_moments" (id, name, description, slug, color, icon, "order", "isActive", "createdAt", "updatedAt")
VALUES
  (
    'cm123satisfacao',
    'Satisfação e Pós-Mercado',
    'Pesquisas de satisfação de clientes e acompanhamento pós-venda',
    'satisfacao-pos-mercado',
    '#3B82F6',
    'BarChart3',
    1,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'cm123cadaverlab',
    'Treinamento Cadáver Lab',
    'Avaliações de satisfação dos treinamentos práticos em laboratório',
    'treinamento-cadaver-lab',
    '#10B981',
    'GraduationCap',
    2,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
