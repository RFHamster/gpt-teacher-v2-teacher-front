/**
 * Helpers para simular latência e falhas de rede em mocks.
 * Quando o backend estiver pronto, basta substituir a implementação dos services
 * por chamadas reais — os hooks/components não precisam mudar.
 */

export function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockResponse<T>(data: T, ms = 300): Promise<T> {
  await delay(ms);
  return data;
}

export async function mockMaybeFail<T>(
  data: T,
  ms = 300,
  failureRate = 0,
): Promise<T> {
  await delay(ms);
  if (Math.random() < failureRate) {
    throw new Error("Falha simulada");
  }
  return data;
}

let counter = 0;
export function mockId(prefix = "id"): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
