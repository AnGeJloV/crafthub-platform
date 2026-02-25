package com.crafthub.backend.service;

import com.crafthub.backend.model.*;
import com.crafthub.backend.repository.OrderRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final OrderRepository orderRepository;

    /**
     * Генерирует PDF отчет по продажам для конкретного мастера.
     */
    public byte[] generateSellerReport(User seller) {
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .filter(o -> o.getItems().stream().anyMatch(i -> i.getProduct().getSeller().getId().equals(seller.getId())))
                .toList();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);

            document.open();

            // Заголовок
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Sales Report - CraftHub", headerFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph("Seller: " + seller.getFullName()));
            document.add(new Paragraph("Total completed orders: " + orders.size()));
            document.add(new Paragraph(" ")); // Пустая строка

            // Таблица
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.addCell("Order ID");
            table.addCell("Date");
            table.addCell("Address");
            table.addCell("Amount");

            for (Order order : orders) {
                table.addCell(order.getId().toString());
                table.addCell(order.getCreatedAt().toString().substring(0, 10));
                table.addCell(order.getShippingAddress());
                table.addCell(order.getTotalAmount().toString() + " BYN");
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    /**
     * Сводный отчет для администратора.
     */
    public byte[] generateAdminReport() {
        List<Order> allOrders = orderRepository.findAll();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Paragraph title = new Paragraph("Platform Performance Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Total platform orders: " + allOrders.size()));
            document.add(new Paragraph("Completed orders: " + allOrders.stream().filter(o -> o.getStatus() == OrderStatus.COMPLETED).count()));
            document.add(new Paragraph("Active disputes: " + allOrders.stream().filter(o -> o.getStatus() == OrderStatus.DISPUTED).count()));

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Admin PDF", e);
        }
    }
}