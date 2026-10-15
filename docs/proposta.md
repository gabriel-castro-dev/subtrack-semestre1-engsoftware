# SubTrack — Controle de Assinaturas

## Tema

Sistema web para organizar assinaturas de serviços digitais e acompanhar despesas recorrentes, ajudando o usuário a controlar seus gastos mensais e anuais.

## Objetivo

Permitir que o usuário cadastre e acompanhe suas assinaturas em um só lugar, consultando valores, periodicidade, próximas renovações e status.

## Entidade principal: Assinatura

Cada assinatura poderá conter:

- Nome do serviço;
- Categoria;
- Valor e moeda;
- Periodicidade da cobrança;
- Data de renovação;
- Status da assinatura.

## API pública

O sistema poderá utilizar a [Frankfurter API](https://www.frankfurter.app/) para consultar taxas de câmbio e converter para reais os valores de assinaturas internacionais.
