package com.crafthub.backend.config;

import com.crafthub.backend.model.*;
import com.crafthub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final VerificationRequestRepository verificationRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductImageRepository productImageRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Value("${upload.path}")
    private String uploadPath;

    // Ссылки на товары (12 штук)
    private final String LINK_POTTERY_1 = "https://images.pexels.com/photos/5799831/pexels-photo-5799831.jpeg";
    private final String LINK_POTTERY_2 = "https://images.pexels.com/photos/718760/pexels-photo-718760.jpeg";
    private final String LINK_WOOD_1 = "https://images.pexels.com/photos/164005/pexels-photo-164005.jpeg";
    private final String LINK_WOOD_2 = "https://images.pexels.com/photos/4115559/pexels-photo-4115559.jpeg";
    private final String LINK_TEXTILE_1 = "https://images.pexels.com/photos/10016091/pexels-photo-10016091.jpeg";
    private final String LINK_TEXTILE_2 = "https://images.pexels.com/photos/9324371/pexels-photo-9324371.jpeg";
    private final String LINK_DECOR_1 = "https://images.pexels.com/photos/1123256/pexels-photo-1123256.jpeg";
    private final String LINK_DECOR_2 = "https://images.pexels.com/photos/8500501/pexels-photo-8500501.jpeg";
    private final String LINK_JEWELRY_1 = "https://images.pexels.com/photos/265916/pexels-photo-265916.jpeg";
    private final String LINK_JEWELRY_2 = "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908";
    private final String LINK_PENDING_1 = "https://images.pexels.com/photos/15652748/pexels-photo-15652748.jpeg";
    private final String LINK_PENDING_2 = "https://images.pexels.com/photos/15325460/pexels-photo-15325460.jpeg";

    // Ссылки на документы (2 штуки для модерации)
    private final String LINK_DOC_1 = "https://ipshnik.com/wp-content/uploads/2015/04/0_______Rekvizityi-IP-obrazets-OBRAZETS.png";

    private final Random random = new Random();

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        try {
            // Подготовка папок
            Files.createDirectories(Paths.get(uploadPath, "products"));
            Files.createDirectories(Paths.get(uploadPath, "documents"));

            // Создание пользователей
            User admin = createUser("Главный Администратор", "admin@crafthub.by", "adminadmin", "+375291111111", Role.ROLE_ADMIN, "Системный администратор платформы CraftHub.");
            User s1 = createUser("Анна Смирнова", "anna@crafthub.by", "password", "+375292222222", Role.ROLE_SELLER, "Профессиональный гончар с 12-летним опытом работы. Окончила Белорусскую государственную академию искусств по специальности «Декоративно-прикладное искусство». Каждое изделие создаю вручную на гончарном круге, использую только экологически чистую глину из местных карьеров. Глазури — собственного производства, без свинца и кадмия. Мои работы были представлены на фестивалях «Город мастеров» и «Славянский базар». Принимаю индивидуальные заказы, срок изготовления — от 5 до 14 дней. Доставка по всей Беларуси.");
            User s2 = createUser("Михаил Древ", "mihail@crafthub.by", "password", "+375293333333", Role.ROLE_SELLER, "Столяр-краснодеревщик в третьем поколении. Моя мастерская находится в Минской области, где я создаю мебель и предметы интерьера из натуральной древесины — дуба, ясеня, ореха и вишни. Работаю исключительно с массивом, не использую ДСП и МДФ. Каждый предмет проходит ручную шлифовку и покрывается натуральным маслом или воском. Специализируюсь на мебели в стилях лофт, сканди и рустик. Готов выполнить проект по вашим чертежам или разработать дизайн с нуля. Гарантия на все изделия — 3 года.");
            User s3 = createUser("Марина Лён", "marina@crafthub.by", "password", "+375298888888", Role.ROLE_SELLER, "Дизайнер текстильных изделий, влюблённая в натуральные ткани. Работаю с белорусским льном высочайшего качества от Оршанского льнокомбината. Создаю одежду, аксессуары и предметы для дома — от повседневных платьев до праздничных скатертей с ручной вышивкой. Каждое изделие продумано до мелочей: от выбора нитей до последнего стежка. Мои работы сочетают белорусские традиции и современный минималистичный дизайн. Участница экомаркетов «Зялёны кірмаш» и ярмарки «Рукадзелле». Пошив на заказ по индивидуальным меркам.");
            User s4 = createUser("Артём Ювелир", "artem@crafthub.by", "password", "+375299999999", Role.ROLE_SELLER, "Ювелир-художник, создающий авторские украшения и предметы декора. Окончил курсы ювелирного мастерства в Санкт-Петербурге, стажировался в мастерских Праги. Работаю с серебром 925 пробы, натуральными камнями и минералами. Каждое украшение — это маленькая история, вдохновлённая природой Беларуси. Помимо украшений, создаю интерьерные свечи, зеркала в авторских рамах и другие элементы декора. Все изделия поставляются в фирменной подарочной упаковке. Возможна гравировка и персонализация.");

            User b1 = createUser("Иван Покупатель", "ivan@crafthub.by", "password", "+375294444444", Role.ROLE_USER, "Ценитель ручной работы и всего уникального. Коллекционирую авторскую керамику и предметы интерьера ручной работы. Считаю, что вещи, сделанные с душой, создают особую атмосферу в доме. На CraftHub нашёл множество талантливых мастеров и с удовольствием поддерживаю их творчество. Всегда оставляю честные и подробные отзывы.");
            User b2 = createUser("Елена Иванова", "elena@crafthub.by", "password", "+375295555555", Role.ROLE_USER, "Люблю дарить необычные подарки близким и друзьям. Уверена, что лучший подарок — это тот, который сделан вручную и несёт в себе тепло мастера. На CraftHub ищу оригинальные украшения, текстиль для дома и предметы декора. Особенно ценю экологичность материалов и индивидуальный подход продавцов. Рада, что такая площадка появилась в Беларуси!");

            // Юзеры на модерации
            User p1 = createUser("Олег Кожа", "oleg@crafthub.by", "password", "+375296666666", Role.ROLE_USER, "Мастер по работе с натуральной кожей. Более 8 лет создаю кошельки, ремни, обложки для документов, сумки и рюкзаки из итальянской и аргентинской кожи растительного дубления. Каждое изделие прошивается вручную седельным швом вощёной нитью, что гарантирует долговечность. Готовлюсь пройти верификацию, чтобы начать продавать свои работы на CraftHub и порадовать ценителей качественных кожаных аксессуаров.");
            downloadAndCreateRequest(p1, "ИП Кожевников Олег Сергеевич, УНП 193284756, зарегистрирован Минским горисполкомом 15.03.2021. Юридический адрес: г. Минск, ул. Притыцкого, д. 62, кв. 14. Основной вид деятельности: производство изделий из кожи (ОКЭД 15120).", LINK_DOC_1, "oleg_doc.jpg");

            User p2 = createUser("Инна Декор", "inna@crafthub.by", "password", "+375297777777", Role.ROLE_USER, "Флорист-декоратор, специализируюсь на создании интерьерных композиций из сухоцветов, стабилизированных растений и природных материалов. Мои работы — это венки на дверь, букеты в вазах, настенные панно и свадебный декор, которые сохраняют свою красоту годами без полива и ухода. Прошла обучение во флористической школе «Цветочный лофт» в Москве. Хочу пройти верификацию и предложить свои работы покупателям CraftHub.");
            downloadAndCreateRequest(p2, "Самозанятая Иннова Инна Викторовна, справка о постановке на учёт в налоговом органе №12-45/2023 от 20.06.2023. Вид деятельности: изготовление и реализация декоративных изделий ручной работы. Адрес: г. Гродно, ул. Советская, д. 18, кв. 7.", LINK_DOC_1, "inna_doc.jpg");

            // Категории
            Category ceramics = categoryRepository.findByName("CERAMICS").orElseThrow();
            Category woodwork = categoryRepository.findByName("WOODWORK").orElseThrow();
            Category textiles = categoryRepository.findByName("TEXTILES").orElseThrow();
            Category decor = categoryRepository.findByName("DECOR").orElseThrow();
            Category jewelry = categoryRepository.findByName("JEWELRY").orElseThrow();

            // Товары
            List<Product> activeProds = new ArrayList<>();
            activeProds.add(downloadAndCreateProduct("Набор кружек «Лесная сказка»", "Набор из четырёх керамических кружек ручной работы, вдохновлённых белорусским лесом. Каждая кружка украшена рельефным рисунком — листья папоротника, ветви дуба, силуэты грибов и лесных ягод. Изготовлены из красной глины на гончарном круге, покрыты матовой глазурью в тёплых земляных тонах — от песочного до тёмно-коричневого. Объём каждой кружки — 300 мл. Подходят для микроволновой печи и посудомоечной машины. Идеальный подарок для любителей уютных чаепитий и природной эстетики. Поставляются в крафтовой коробке с сухоцветами.", new BigDecimal("60"), 10, ProductStatus.ACTIVE, ceramics, s1, LINK_POTTERY_1, "pot1.jpg", "dQw4w9WgXcQ"));
            activeProds.add(downloadAndCreateProduct("Ваза «Океанская волна»", "Элегантная интерьерная ваза, выполненная в технике ручной росписи кобальтовыми красками по белоснежной глазури. Плавные переходы от глубокого синего к бирюзовому создают эффект морской волны, застывшей в керамике. Высота вазы — 28 см, диаметр горлышка — 8 см. Подходит как для живых цветов, так и для сухоцветов. Каждая ваза уникальна, так как роспись никогда не повторяется — вы получите единственный в своём роде экземпляр.", new BigDecimal("120"), 2, ProductStatus.ACTIVE, ceramics, s1, LINK_POTTERY_2, "pot2.jpg", null));
            activeProds.add(downloadAndCreateProduct("Разделочная доска из дуба «Хлебосол»", "Массивная разделочная доска из цельного куска белорусского дуба, обработанная пищевым минеральным маслом и пчелиным воском. Размер — 40×25×3 см. Оснащена удобной ручкой с кожаным подвесом и желобком для сбора сока по периметру. Дуб — одна из самых твёрдых пород древесины, поэтому доска устойчива к порезам и деформации. Обладает природными антибактериальными свойствами.", new BigDecimal("90"), 15, ProductStatus.ACTIVE, woodwork, s2, LINK_WOOD_1, "wood1.jpg", null));
            activeProds.add(downloadAndCreateProduct("Обеденный стол «Минский лофт»", "Обеденный стол в стиле лофт, сочетающий брутальность металла и теплоту натурального дерева. Столешница выполнена из массива ясеня толщиной 40 мм, обработана методом браширования для подчёркивания естественной текстуры древесины и покрыта износостойким полиуретановым лаком в два слоя. Подстолье — сварная конструкция из профильной стали 60×40 мм.", new BigDecimal("450"), 3, ProductStatus.ACTIVE, woodwork, s2, LINK_WOOD_2, "wood2.jpg", null));
            activeProds.add(downloadAndCreateProduct("Льняное платье «Васільковае лета»", "Лёгкое летнее платье свободного кроя из 100% белорусского льна Оршанского льнокомбината. Ткань плотностью 185 г/м² — достаточно плотная, чтобы не просвечивать, но при этом невероятно лёгкая и дышащая. Фасон А-силуэта длиной до колена, с V-образным вырезом и рукавами три четверти. Цвет — натуральный небелёный лён с деликатной вышивкой васильков на кармане.", new BigDecimal("130"), 5, ProductStatus.ACTIVE, textiles, s3, LINK_TEXTILE_1, "text1.jpg", null));
            activeProds.add(downloadAndCreateProduct("Сумка-шоппер «Палеская вышыванка»", "Вместительная сумка-шоппер из плотного натурального льна с ручной вышивкой традиционным белорусским орнаментом. Размер — 42×38 см, длина ручек позволяет носить сумку как в руке, так и на плече. Внутри — карман на молнии для мелочей и кошелька. Вышивка выполнена нитками мулине в красно-чёрной цветовой гамме — классическое сочетание полесского орнамента.", new BigDecimal("45"), 20, ProductStatus.ACTIVE, textiles, s3, LINK_TEXTILE_2, "text2.jpg", null));
            activeProds.add(downloadAndCreateProduct("Ароматическая свеча «Сандаловый лес»", "Натуральная ароматическая свеча из соевого воска с эфирными маслами сандала, кедра и ветивера. Аромат тёплый, древесный, с лёгкими бальзамическими нотками — создаёт атмосферу уюта и спокойствия, идеален для вечерней медитации или отдыха после рабочего дня. Свеча залита в минималистичный бетонный подсвечник ручной работы. Время горения — около 45 часов.", new BigDecimal("30"), 30, ProductStatus.ACTIVE, decor, s4, LINK_DECOR_1, "dec1.jpg", null));
            activeProds.add(downloadAndCreateProduct("Настенное зеркало «Солнце Полесья»", "Декоративное настенное зеркало в авторской раме, вдохновлённое солнечными мотивами белорусского народного искусства. Рама выполнена из металлических лучей, покрытых сусальным золотом, с чередованием длинных и коротких элементов. Диаметр зеркала — 30 см, общий диаметр с рамой — 65 см. Зеркальное полотно — влагостойкое, толщиной 4 мм.", new BigDecimal("210"), 1, ProductStatus.ACTIVE, decor, s4, LINK_DECOR_2, "dec2.jpg", null));
            activeProds.add(downloadAndCreateProduct("Серебряное кольцо «Лесной ручей»", "Авторское кольцо из серебра 925 пробы, созданное методом ручной ковки и чеканки. Поверхность кольца имитирует текстуру речной гальки — гладкие, органичные формы с лёгкой патиной, подчёркивающей рельеф. Ширина шинки — 6 мм, вес — около 5 г. Каждое кольцо имеет клеймо мастера и пробирное клеймо. Возможна гравировка надписи на внутренней стороне.", new BigDecimal("85"), 4, ProductStatus.ACTIVE, jewelry, s4, LINK_JEWELRY_1, "jew1.jpg", null));
            activeProds.add(downloadAndCreateProduct("Кулон «Хрустальная капля»", "Изысканный кулон с натуральным горным хрусталём в серебряной оправе ручной работы. Камень огранён в форме капли размером 18×12 мм, кристально прозрачный, с природными включениями, которые делают каждый экземпляр неповторимым. Оправа из серебра 925 пробы выполнена в виде переплетающихся ветвей. Цепочка длиной 45 см входит в комплект.", new BigDecimal("115"), 2, ProductStatus.ACTIVE, jewelry, s4, LINK_JEWELRY_2, "jew2.jpg", null));

            // Товары на модерации
            downloadAndCreateProduct("Тарелка декоративная «Купалле»", "Настенная декоративная тарелка диаметром 26 см с ручной росписью на тему белорусского праздника Купалье. На тарелке изображён костёр, силуэты танцующих людей и цветок папоротника — символ удачи и волшебства. Роспись выполнена подглазурными красками, устойчивыми к выцветанию.", new BigDecimal("25"), 10, ProductStatus.PENDING, ceramics, s1, LINK_PENDING_1, "pending1.jpg", null);
            downloadAndCreateProduct("Браслет-оберег «Шлях Вялесу»", "Мужской браслет из серебра 925 пробы с элементами славянской символики. Центральный элемент — знак Велеса, бога мудрости и покровителя ремесленников в славянской мифологии. Браслет выполнен в технике литья с последующей ручной доработкой и чернением. Ширина — 12 мм.", new BigDecimal("35"), 3, ProductStatus.PENDING, jewelry, s4, LINK_PENDING_2, "pending2.jpg", null);

            // Заказы
            List<User> buyers = List.of(b1, b2, p1, p2);

            String[] reviewComments = {
                    "Отличное качество! Изделие полностью соответствует описанию и фотографиям. Мастер очень аккуратно упаковал товар, доставка была быстрой. Обязательно закажу ещё!",
                    "Прекрасная работа мастера! Видно, что каждая деталь продумана с любовью. Получила массу комплиментов от друзей. Рекомендую этот магазин всем ценителям ручной работы.",
                    "Заказывала в подарок маме — она была в восторге! Качество материалов на высоте, ручная работа чувствуется в каждой мелочи. Спасибо мастеру за талант и ответственный подход!",
                    "Очень доволен покупкой. Товар пришёл даже лучше, чем я ожидал по фотографиям. Упаковка продуманная, ничего не повредилось при доставке. Пять звёзд заслуженно!",
                    "Уже не первый раз заказываю у этого мастера и каждый раз остаюсь довольна. Стабильно высокое качество, приятное общение и оперативная отправка. Буду заказывать снова!",
                    "Замечательное изделие! Чувствуется, что сделано с душой. Особенно понравилась подарочная упаковка — не пришлось дополнительно тратиться. Мастеру — огромное спасибо!",
                    "Красивая и качественная вещь. Немного отличается по цвету от фото (чуть темнее), но в целом очень нравится. Мастер предупредил, что каждое изделие уникально — это даже плюс.",
                    "Великолепно! Именно то, что я искала. Натуральные материалы, аккуратное исполнение, быстрая доставка. Приятно поддерживать белорусских мастеров. Однозначно рекомендую!"
            };

            String[] addresses = {
                    "г. Минск, пр. Независимости, д. 58, кв. 12",
                    "г. Минск, ул. Немига, д. 3, кв. 45",
                    "г. Гродно, ул. Советская, д. 18, кв. 7",
                    "г. Брест, ул. Гоголя, д. 25, кв. 3",
                    "г. Витебск, пр. Фрунзе, д. 11, кв. 89",
                    "г. Гомель, ул. Советская, д. 97, кв. 16",
                    "г. Могилёв, бул. Ленина, д. 5, кв. 22",
                    "г. Минск, ул. Сурганова, д. 47а, кв. 101",
                    "г. Минск, ул. Притыцкого, д. 62, кв. 14",
                    "г. Бобруйск, ул. Минская, д. 34, кв. 8"
            };

            int guaranteedOrderCount = 0;
            for (Product product : activeProds) {
                int reviewsToCreate = 2 + random.nextInt(2);
                for (int j = 0; j < reviewsToCreate; j++) {
                    User buyer = buyers.get((j + activeProds.indexOf(product)) % buyers.size()); // чередуем покупателей
                    int qty = random.nextInt(2) + 1;

                    Order order = orderRepository.save(Order.builder()
                            .buyer(buyer)
                            .shippingAddress(addresses[random.nextInt(addresses.length)])
                            .status(OrderStatus.COMPLETED)
                            .totalAmount(product.getPrice().multiply(BigDecimal.valueOf(qty)))
                            .build());

                    orderItemRepository.save(OrderItem.builder()
                            .order(order)
                            .product(product)
                            .quantity(qty)
                            .priceAtPurchase(product.getPrice())
                            .build());

                    jdbcTemplate.update("UPDATE orders SET created_at = ? WHERE id = ?",
                            generateRandomDateInLastMonth(), order.getId());

                    Review review = reviewRepository.save(Review.builder()
                            .rating(random.nextInt(2) + 4) // 4 или 5
                            .comment(reviewComments[random.nextInt(reviewComments.length)])
                            .product(product)
                            .author(buyer)
                            .order(order)
                            .build());

                    jdbcTemplate.update("UPDATE reviews SET created_at = ? WHERE id = ?",
                            generateRandomDateInLastMonth(), review.getId());

                    guaranteedOrderCount++;
                }
            }

            OrderStatus[] st = {OrderStatus.COMPLETED, OrderStatus.SHIPPED, OrderStatus.DISPUTED, OrderStatus.CANCELLED};
            int remainingOrders = Math.max(0, 50 - guaranteedOrderCount);

            for (int i = 0; i < remainingOrders; i++) {
                User buyer = buyers.get(random.nextInt(buyers.size()));
                Product product = activeProds.get(random.nextInt(activeProds.size()));
                int qty = random.nextInt(2) + 1;
                OrderStatus status = st[random.nextInt(st.length)];

                Order order = orderRepository.save(Order.builder()
                        .buyer(buyer)
                        .shippingAddress(addresses[random.nextInt(addresses.length)])
                        .status(status)
                        .totalAmount(product.getPrice().multiply(BigDecimal.valueOf(qty)))
                        .build());

                jdbcTemplate.update("UPDATE orders SET created_at = ? WHERE id = ?",
                        generateRandomDateInLastMonth(), order.getId());

                orderItemRepository.save(OrderItem.builder()
                        .order(order)
                        .product(product)
                        .quantity(qty)
                        .priceAtPurchase(product.getPrice())
                        .build());

                if (status == OrderStatus.COMPLETED) {
                    Review review = reviewRepository.save(Review.builder()
                            .rating(random.nextInt(2) + 4)
                            .comment(reviewComments[random.nextInt(reviewComments.length)])
                            .product(product)
                            .author(buyer)
                            .order(order)
                            .build());

                    jdbcTemplate.update("UPDATE reviews SET created_at = ? WHERE id = ?",
                            generateRandomDateInLastMonth(), review.getId());
                }
            }

            recalculateAllRatings();
            System.out.println("Генерация завершена.");

        } catch (Exception e) {
            System.err.println("Ошибка при генерации: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private User createUser(String name, String email, String pwd, String phone, Role role, String bio) {
        User user = User.builder()
                .fullName(name)
                .email(email)
                .password(passwordEncoder.encode(pwd))
                .phoneNumber(phone)
                .role(role)
                .bio(bio)
                .enabled(true)
                .build();

        User saved = userRepository.save(user);

        java.time.LocalDateTime oldDate = java.time.LocalDateTime.now().minusDays(50);
        jdbcTemplate.update("UPDATE users SET created_at = ?, updated_at = ? WHERE id = ?",
                oldDate, oldDate, saved.getId());

        return saved;
    }

    private void downloadAndCreateRequest(User user, String info, String link, String fileName) {
        downloadFile(link, "documents/" + fileName);

        verificationRepository.save(VerificationRequest.builder()
                .user(user)
                .legalInfo(info)
                .documentUrl("documents/" + fileName)
                .status(VerificationStatus.PENDING)
                .build());
    }

    private Product downloadAndCreateProduct(String name, String desc, BigDecimal price, int stock, ProductStatus status, Category cat, User s, String link, String fileName, String vid) {
        downloadFile(link, "products/" + fileName);
        Product p = Product.builder().name(name).description(desc).price(price).stockQuantity(stock).status(status).category(cat).seller(s).youtubeVideoId(vid).build();
        Product saved = productRepository.save(p);
        java.time.LocalDateTime oldDate = java.time.LocalDateTime.now().minusDays(40);
        jdbcTemplate.update("UPDATE products SET created_at = ?, updated_at = ? WHERE id = ?",
                oldDate, oldDate, saved.getId());
        productImageRepository.save(ProductImage.builder().imageUrl("products/" + fileName).isMain(true).product(saved).build());
        return saved;
    }

    private void downloadFile(String urlString, String relativePath) {
        try {
            Path targetPath = Paths.get(uploadPath).resolve(relativePath);
            if (Files.exists(targetPath)) return;

            URL url = new URL(urlString);
            URLConnection conn = url.openConnection();
            conn.setRequestProperty("User-Agent", "Mozilla/5.0");

            try (InputStream in = conn.getInputStream()) {
                Files.copy(in, targetPath);
            }
        } catch (Exception e) {
            System.err.println("Не удалось скачать " + urlString + ": " + e.getMessage());
        }
    }

    private void recalculateAllRatings() {
        productRepository.findAll().forEach(p -> {
            Double rating = reviewRepository.calculateAverageRatingForProduct(p.getId());
            int count = reviewRepository.findAllByProductIdOrderByCreatedAtDesc(p.getId()).size();
            if (rating != null && count > 0) {
                p.setAverageRating(Math.round(rating * 10.0) / 10.0);
            } else {
                p.setAverageRating(0.0);
            }
            p.setReviewsCount(count);
            productRepository.save(p);
        });
        userRepository.findAll().forEach(u -> {
            if (u.getRole() == Role.ROLE_SELLER) {
                Double sellerRating = reviewRepository.calculateAverageRatingForSeller(u.getId());
                Integer sellerCount = reviewRepository.countReviewsForSeller(u.getId());
                if (sellerRating != null && sellerCount != null && sellerCount > 0) {
                    u.setAverageRating(Math.round(sellerRating * 10.0) / 10.0);
                    u.setReviewsCount(sellerCount);
                } else {
                    u.setAverageRating(0.0);
                    u.setReviewsCount(0);
                }
                userRepository.save(u);
            }
        });
    }

    private LocalDateTime generateRandomDateInLastMonth() {
        return LocalDateTime.now()
                .minusDays(random.nextInt(30))
                .minusHours(random.nextInt(24))
                .minusMinutes(random.nextInt(60));
    }
}