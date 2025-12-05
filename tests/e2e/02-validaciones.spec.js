import { test, expect } from '@playwright/test';

test.describe('Validacion de datos incorrectos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/../frontend/index.html');
  });

  test('Validar email invalido', async ({ page }) => {
    await page.fill('#nombre', 'Maria Lopez');
    await page.fill('#email', 'email-invalido');
    await page.fill('#telefono', '+51912345678');
    await page.click('button[type="submit"]');

    await expect(page.locator('#mensajePaciente')).toContainText('Error');
  });

  test('Validar campos vacios en registro de paciente', async ({ page }) => {
    await page.fill('#nombre', '');
    await page.fill('#email', '');
    await page.fill('#telefono', '');
    
    await page.click('button[type="submit"]');

    const nombreInput = page.locator('#nombre');
    const isRequired = await nombreInput.evaluate((el) => el.required);
    expect(isRequired).toBeTruthy();
  });

  test('Validar telefono invalido', async ({ page }) => {
    const timestamp = Date.now();
    await page.fill('#nombre', `Carlos Sanchez ${timestamp}`);
    await page.fill('#email', `carlos${timestamp}@email.com`);
    await page.fill('#telefono', '123');
    await page.click('button[type="submit"]');

    await expect(page.locator('#mensajePaciente')).toContainText('Error');
  });

  test('Validar email duplicado', async ({ page }) => {
    const timestamp = Date.now();
    const nombre = `Pedro Garcia ${timestamp}`;
    const email = `pedro${timestamp}@email.com`;
    const telefono = '+51923456789';

    await page.fill('#nombre', nombre);
    await page.fill('#email', email);
    await page.fill('#telefono', '+51923456789');
    await page.click('button[type="submit"]');

    await expect(page.locator('#mensajePaciente')).toBeVisible();

    await page.fill('#nombre', 'Pedro Garcia Segundo');
    await page.fill('#email', email);
    await page.fill('#telefono', '+51934567890');
    await page.click('button[type="submit"]');

    await expect(page.locator('#mensajePaciente')).toContainText('ya esta registrado');
  });

  test('Validar campos vacios en agendamiento de cita', async ({ page }) => {
    await page.selectOption('#pacienteId', '');
    await page.fill('#doctor', '');
    await page.fill('#fecha', '');
    await page.fill('#hora', '');
    
    await page.locator('#formCita button[type="submit"]').click();

    const pacienteSelect = page.locator('#pacienteId');
    const isRequired = await pacienteSelect.evaluate((el) => el.required);
    expect(isRequired).toBeTruthy();
  });
});
