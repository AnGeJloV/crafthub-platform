package com.crafthub.backend.service;

import com.crafthub.backend.dto.stats.TopSellerStats;
import com.crafthub.backend.model.*;
import com.crafthub.backend.repository.OrderRepository;
import com.crafthub.backend.repository.ProductRepository;
import com.crafthub.backend.repository.UserRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Сервис управления отчетами
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    private static final BigDecimal PLATFORM_FEE_PERCENT = new BigDecimal("0.10");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    private BaseFont getCyrillicFont() {
        try {
            String fontPath = new ClassPathResource("fonts/arial.ttf").getURL().toString();
            return BaseFont.createFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
        } catch (Exception e) {
            try {
                return BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, BaseFont.NOT_EMBEDDED);
            } catch (Exception ex) {
                throw new RuntimeException(ex);
            }
        }
    }

    /**
     * Генерирует PDF отчет по продажам для конкретного мастера.
     */
    public byte[] generateSellerReport(User seller) {
        List<Order> allOrders = orderRepository.findAll().stream()
                .filter(o -> o.getItems().stream().anyMatch(i -> i.getProduct().getSeller().getId().equals(seller.getId())))
                .toList();

        List<Order> completedOrders = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.COMPLETED).toList();

        BigDecimal grossRevenue = completedOrders.stream()
                .flatMap(o -> o.getItems().stream())
                .filter(i -> i.getProduct().getSeller().getId().equals(seller.getId()))
                .map(i -> i.getPriceAtPurchase().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal platformFee = grossRevenue.multiply(PLATFORM_FEE_PERCENT).setScale(2, RoundingMode.HALF_UP);
        BigDecimal netIncome = grossRevenue.subtract(platformFee);

        long canceledCount = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.CANCELLED).count();
        long disputeCount = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.DISPUTED).count();
        long activeCount = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.SHIPPED || o.getStatus() == OrderStatus.PAID).count();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);
            document.open();

            addTitle(document, "ОТЧЕТ О ПРОДАЖАХ - ПРОДАВЕЦ");
            BaseFont bf = getCyrillicFont();
            Font fontNormal = new Font(bf, 10);

            document.add(new Paragraph("Продавец: " + seller.getFullName() + " | Email: " + seller.getEmail(), fontNormal));
            document.add(new Paragraph("Дата формирования: " + LocalDateTime.now().format(DATE_FORMATTER), fontNormal));
            addEmptyLine(document, 1);

            PdfPTable moneyTable = new PdfPTable(3);
            moneyTable.setWidthPercentage(100);
            moneyTable.addCell(createCell("Валовая выручка:\n" + grossRevenue + " BYN", true, bf));
            moneyTable.addCell(createCell("Комиссия платформы (10%):\n-" + platformFee + " BYN", true, bf));
            moneyTable.addCell(createCell("Чистый доход:\n" + netIncome + " BYN", true, bf));
            document.add(moneyTable);

            PdfPTable statsTable = new PdfPTable(4);
            statsTable.setWidthPercentage(100);
            statsTable.addCell(createCell("Всего заказов: " + allOrders.size(), false, bf));
            statsTable.addCell(createCell("Завершено: " + completedOrders.size(), false, bf));
            statsTable.addCell(createCell("В работе (Оплачен/В пути): " + activeCount, false, bf));
            statsTable.addCell(createCell("Проблемные/Отмена: " + (canceledCount + disputeCount), false, bf));
            document.add(statsTable);

            addEmptyLine(document, 1);

            document.add(new Paragraph("Детализация заказов:", new Font(bf, 14, Font.BOLD)));
            addEmptyLine(document, 1);

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1f, 2f, 2f, 2.5f, 3f, 1.5f, 1.5f});

            String[] headers = {"ID", "Дата", "Статус", "Город", "Товары", "Сумма", "Чистыми"};
            for (String header : headers) {
                table.addCell(createHeaderCell(header, bf));
            }

            for (Order order : allOrders) {
                BigDecimal orderGross = order.getItems().stream()
                        .filter(i -> i.getProduct().getSeller().getId().equals(seller.getId()))
                        .map(i -> i.getPriceAtPurchase().multiply(BigDecimal.valueOf(i.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal orderFee = orderGross.multiply(PLATFORM_FEE_PERCENT).setScale(2, RoundingMode.HALF_UP);
                BigDecimal orderNet = orderGross.subtract(orderFee);

                String itemsStr = order.getItems().stream()
                        .filter(i -> i.getProduct().getSeller().getId().equals(seller.getId()))
                        .map(i -> i.getProduct().getName() + " (x" + i.getQuantity() + ")")
                        .collect(Collectors.joining("\n"));

                table.addCell(createCell(order.getId().toString(), false, bf));
                table.addCell(createCell(order.getCreatedAt().toString().substring(0, 10), false, bf));
                table.addCell(createCell(translateStatus(order.getStatus()), false, bf));
                table.addCell(createCell(extractCity(order.getShippingAddress()), false, bf));
                table.addCell(createCell(itemsStr, false, bf));
                table.addCell(createCell(orderGross + " BYN", false, bf));
                table.addCell(createCell(orderNet + " BYN", true, bf));
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Seller PDF", e);
        }
    }

    /**
     * Сводный отчет для администратора.
     */
    public byte[] generateAdminReport() {
        List<Order> allOrders = orderRepository.findAll();
        long completedCount = orderRepository.countByStatus(OrderStatus.COMPLETED);

        BigDecimal gmv = orderRepository.calculateTotalGmv();
        if (gmv == null) gmv = BigDecimal.ZERO;
        BigDecimal platformRevenue = gmv.multiply(PLATFORM_FEE_PERCENT).setScale(2, RoundingMode.HALF_UP);
        BigDecimal avgCheck = completedCount > 0 ? gmv.divide(BigDecimal.valueOf(completedCount), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            BaseFont bf = getCyrillicFont();
            addTitle(document, "ОТЧЕТ ПО ПЛАТФОРМЕ");
            document.add(new Paragraph("Сформирован: " + LocalDateTime.now().format(DATE_FORMATTER), new Font(bf, 10)));
            addEmptyLine(document, 2);

            document.add(new Paragraph("1. Финансовые показатели", new Font(bf, 14, Font.BOLD)));
            addEmptyLine(document, 1);

            PdfPTable finTable = new PdfPTable(3);
            finTable.setWidthPercentage(100);
            finTable.addCell(createCell("Оборот (GMV):\n" + gmv + " BYN", true, bf));
            finTable.addCell(createCell("Выручка платформы:\n" + platformRevenue + " BYN", true, bf));
            finTable.addCell(createCell("Средний чек:\n" + avgCheck + " BYN", true, bf));
            document.add(finTable);
            addEmptyLine(document, 1);

            document.add(new Paragraph("2. Статистика заказов", new Font(bf, 14, Font.BOLD)));
            addEmptyLine(document, 1);

            PdfPTable ordTable = new PdfPTable(3);
            ordTable.setWidthPercentage(100);

            ordTable.addCell(createCell("Всего: " + allOrders.size(), false, bf));
            ordTable.addCell(createCell("Успешных: " + completedCount, false, bf));
            ordTable.addCell(createCell("Оплаченных (ждут): " + orderRepository.countByStatus(OrderStatus.PAID), false, bf));

            ordTable.addCell(createCell("В пути: " + orderRepository.countByStatus(OrderStatus.SHIPPED), false, bf));
            ordTable.addCell(createCell("Отмененных: " + orderRepository.countByStatus(OrderStatus.CANCELLED), false, bf)); // Добавили!
            ordTable.addCell(createCell("Споры: " + orderRepository.countByStatus(OrderStatus.DISPUTED), false, bf));

            document.add(ordTable);
            addEmptyLine(document, 1);

            document.add(new Paragraph("3. Рост базы", new Font(bf, 14, Font.BOLD)));
            addEmptyLine(document, 1);

            PdfPTable userTable = new PdfPTable(3);
            userTable.setWidthPercentage(100);
            userTable.addCell(createCell("Пользователей: " + userRepository.count(), false, bf));
            userTable.addCell(createCell("Активных мастеров: " + userRepository.findAll().stream().filter(u -> u.getRole() == Role.ROLE_SELLER).count(), false, bf));
            userTable.addCell(createCell("Товаров в каталоге: " + productRepository.count(), false, bf));
            document.add(userTable);
            addEmptyLine(document, 2);

            document.add(new Paragraph("Топ-5 Мастеров по объему продаж", new Font(bf, 14, Font.BOLD)));
            addEmptyLine(document, 1);

            PdfPTable topTable = new PdfPTable(3);
            topTable.setWidthPercentage(100);
            topTable.setWidths(new float[]{4f, 1.5f, 2f});

            topTable.addCell(createHeaderCell("Имя мастера", bf));
            topTable.addCell(createHeaderCell("Продаж (шт)", bf));
            topTable.addCell(createHeaderCell("Выручка", bf));

            List<TopSellerStats> topSellers = orderRepository.findTopSellers(PageRequest.of(0, 5));
            for (TopSellerStats ts : topSellers) {
                topTable.addCell(createCell(ts.sellerName(), false, bf));
                topTable.addCell(createCell(String.valueOf(ts.totalSales()), false, bf));
                topTable.addCell(createCell(ts.totalRevenue() + " BYN", false, bf));
            }
            document.add(topTable);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Admin PDF", e);
        }
    }

    private void addTitle(Document document, String text) throws DocumentException {
        BaseFont bf = getCyrillicFont();
        Font titleFont = new Font(bf, 18, Font.BOLD);
        Paragraph title = new Paragraph(text, titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
    }

    private void addEmptyLine(Document document, int number) throws DocumentException {
        for (int i = 0; i < number; i++) {
            document.add(new Paragraph(" "));
        }
    }

    private PdfPCell createHeaderCell(String text, BaseFont bf) {
        PdfPCell cell = new PdfPCell(new Phrase(text, new Font(bf, 10, Font.BOLD)));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBackgroundColor(new java.awt.Color(230, 230, 230));
        cell.setPadding(8f);
        return cell;
    }

    private PdfPCell createCell(String text, boolean isBold, BaseFont bf) {
        Font font = new Font(bf, 10, isBold ? Font.BOLD : Font.NORMAL);
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(6f);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        return cell;
    }

    private String extractCity(String fullAddress) {
        if (fullAddress == null || fullAddress.isEmpty()) return "-";
        if (fullAddress.contains("г.")) {
            int start = fullAddress.indexOf("г.");
            int end = fullAddress.indexOf(",", start);
            if (end == -1) return fullAddress.substring(start);
            return fullAddress.substring(start, end);
        }
        String[] parts = fullAddress.split(",");
        return parts[0].trim();
    }

    private String translateStatus(OrderStatus status) {
        switch (status) {
            case COMPLETED: return "Завершен";
            case CANCELLED: return "Отменен";
            case SHIPPED: return "В пути";
            case DISPUTED: return "Спор";
            case PAID: return "Оплачен";
            default: return status.name();
        }
    }
}