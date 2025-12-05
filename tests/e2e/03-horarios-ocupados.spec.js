import { test, expect } from '@playwright/test';

test.describe('Validacion de horarios ocupados', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/../frontend/index.html');
  });

  test('Intento de agendar cita en horario ya ocupado', async ({ page }) => {
    const timestamp = Date.now();
    const nombre1 = `Ana Martinez ${timestamp}`;
    const email1 = `ana${timestamp}@email.com`;
    const nombre2 = `Luis Torres ${timestamp}`;
    const email2 = `luis${timestamp}@email.com`;

    await page.fill('#nombre', nombre1);
    await page.fill('#email', email1);
    await page.fill('#telefono', '+51945678901');
    await page.click('button[type="submit"]');
    await expect(page.locator('#mensajePaciente')).toBeVisible();

    await page.fill('#nombre', nombre2);
    await page.fill('#email', email2);
    await page.fill('#telefono', '+51956789012');
    await page.click('button[type="submit"]');
    await expect(page.locator('#mensajePaciente')).toBeVisible();

    await page.selectOption('#pacienteId', { label: new RegExp(nombre1) });
    await page.fill('#doctor', 'Dr. Gomez');
    await page.fill('#fecha', '2025-12-20');
    await page.fill('#hora', '14:00');
    await page.locator('#formCita button[type="submit"]').click();

    await expect(page.locator('#mensajeCita')).toContainText('exitosamente');

    await page.selectOption('#pacienteId', { label: new RegExp(nombre) });
    await page.fill('#doctor', 'Dr. Gomez');
    await page.fill('#fecha', '2025-12-20');
    await page.fill('#hora', '14:00');
    await page.locator('#formCita button[type="submit"]').click();

    await expect(page.locator('#mensajeCita')).toContainText('horario ya esta ocupado');
  });

  test('Mismo paciente puede agendar en diferente horario', async ({ page }) => {
    const timestamp = Date.now();
    const nombre = `Sofia Ramirez ${timestamp}`;
    const email = `sofia${timestamp}@email.com`;

    await page.fill('#nombre', nombre);
    await page.fill('#email', email);
    await page.fill('#telefono', '+51967890123');
    await page.click('button[type="submit"]');
    await expect(page.locator('#mensajePaciente')).toBeVisible();

    await page.selectOption('#pacienteId', { label: new RegExp(nombre) });
    await page.fill('#doctor', 'Dr. Vargas');
    await page.fill('#fecha', '2025-12-22');
    await page.fill('#hora', '09:00');
    await page.locator('#formCita button[type="submit"]').click();

    await expect(page.locator('#mensajeCita')).toContainText('exitosamente');

    await page.selectOption('#pacienteId', { label: new RegExp(nombre2) });
    await page.fill('#doctor', 'Dr. Vargas');
    await page.fill('#fecha', '2025-12-22');
    await page.fill('#hora', '11:00');
    await page.locator('#formCita button[type="submit"]').click();

    await expect(page.locator('#mensajeCita')).toContainText('exitosamente');
  });

  test('Diferentes doctores pueden tener citas en mismo horario', async ({ page }) => {
    const timestamp = Date.now();
    const nombre1 = `Roberto Diaz ${timestamp}`;
    const email1 = `roberto${timestamp}@email.com`;
    const nombre2 = `Elena Castro ${timestamp}`;
    const email2 = `elena${timestamp}@email.com`;

    await page.fill('#nombre', nombre1);
    await page.fill('#email', email1);
    await page.fill('#telefono', '+51978901234');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    await page.fill('#nombre', nombre2);
    await page.fill('#email', email2);
    await page.fill('#telefono', '+51989012345');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    await page.selectOption('#pacienteId', { label: new RegExp(nombre1) });
    await page.fill('#doctor', 'Dr. Mendoza');
    await page.fill('#fecha', '2025-12-25');
    await page.fill('#hora', '15:00');
    await page.locator('#formCita button[type="submit"]').click();

    await expect(page.locator('#mensajeCita')).toContainText('exitosamente');
    await page.waitForTimeout(1000);

    await page.selectOption('#pacienteId', { label: new RegExp(nombre2) });
    await page.fill('#doctor', 'Dr. Herrera');
    await page.fill('#fecha', '2025-12-25');
    await page.fill('#hora', '15:00');
    await page.locator('#formCita button[type="submit"]').click();

    await expect(page.locator('#mensajeCita')).toContainText('exitosamente');
  });
});
