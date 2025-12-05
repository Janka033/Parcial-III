import { test, expect } from '@playwright/test';

test.describe('Cancelacion de citas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/../frontend/index.html');
  });

  test('Cancelar cita exitosamente', async ({ page }) => {
    const timestamp = Date.now();
    const nombre = `Miguel Flores ${timestamp}`;
    const email = `miguel${timestamp}@email.com`;

    await page.fill('#nombre', nombre);
    await page.fill('#email', email);
    await page.fill('#telefono', '+51990123456');
    await page.click('button[type="submit"]');
    await expect(page.locator('#mensajePaciente')).toBeVisible();

    await page.selectOption('#pacienteId', { label: new RegExp(nombre) });
    await page.fill('#doctor', 'Dr. Paredes');
    await page.fill('#fecha', '2025-12-28');
    await page.fill('#hora', '16:00');
    await page.locator('#formCita button[type="submit"]').click();

    await expect(page.locator('#mensajeCita')).toContainText('exitosamente');

    await page.click('#btnActualizar');
    await expect(page.locator('.cita-card')).toContainText(nombre);

    page.on('dialog', dialog => dialog.accept());

    const btnCancelar = page.locator('.btn-cancelar').first();
    await btnCancelar.click();

    await page.click('#btnActualizar');

    const citasVisibles = await page.locator('.cita-card').count();
    const citaConNombre = await page.locator('.cita-card', { hasText: nombre }).count();
    
    expect(citaConNombre).toBe(0);
  });

  test('Verificar que cita cancelada no aparece en lista', async ({ page }) => {
    const timestamp = Date.now();
    const nombre = `Laura Vega ${timestamp}`;
    const email = `laura${timestamp}@email.com`;

    await page.fill('#nombre', nombre);
    await page.fill('#email', email);
    await page.fill('#telefono', '+51901234567');
    await page.click('button[type="submit"]');
    await page.fill('#email', email);
    await page.fill('#telefono', '+51901234567');
    await page.click('button[type="submit"]');
    await expect(page.locator('#mensajePaciente')).toBeVisible();

    await page.selectOption('#pacienteId', { label: new RegExp(nombre) });
    await page.locator('#formCita button[type="submit"]').click();

    await expect(page.locator('#mensajeCita')).toContainText('exitosamente');

    await page.click('#btnActualizar');
    await expect(page.locator('.cita-card')).toContainText(nombre);

    page.on('dialog', dialog => dialog.accept());

    const btnCancelar = page.locator('.btn-cancelar').first();
    await btnCancelar.click();

    await page.click('#btnActualizar');

    const citaEliminada = await page.locator('.cita-card', { hasText: nombre }).count();
    expect(citaEliminada).toBe(0);
  });
});
