// Mock data cho bài học với nội dung chi tiết
export const lessonsData = [
  {
    id: 1,
    title: 'Lịch sử hình thành tỉnh Lâm Đồng mới (2025)',
    slug: 'lich-su-hinh-thanh-lam-dong-moi-2025',
    summary: 'Tìm hiểu về quá trình sát nhập lịch sử tạo nên tỉnh Lâm Đồng mới với 3 vùng đất: Lâm Đồng cũ, Bình Thuận và Đắk Nông.',
    description: 'Khám phá hành trình lịch sử đặc biệt của việc hình thành tỉnh Lâm Đồng mới sau cuộc sát nhập năm 2025.',
    instructor: 'GS.TS Nguyễn Văn Minh',
    duration: '45 phút',
    difficulty: 'Cơ bản',
    rating: 4.9,
    students: 324,
    progress: 0,
    category: 'Lịch sử địa phương',
    tags: ['Lịch sử', 'Sát nhập', 'Lâm Đồng mới', 'Hành chính'],
    status: 'Chưa học',
    contentHtml: `
      <div class="lesson-content">
        <h1>Lịch sử hình thành tỉnh Lâm Đồng mới (2025)</h1>
        
        <div class="intro-section">
          <h2>🌟 Giới thiệu</h2>
          <p>Năm 2025 đánh dấu một cột mốc lịch sử quan trọng trong quá trình phát triển hành chính của Việt Nam với việc sát nhập ba tỉnh <strong>Lâm Đồng, Bình Thuận và Đắk Nông</strong> thành tỉnh Lâm Đồng mới.</p>
          
          <div class="highlight-box">
            <h3>📍 Tỉnh Lâm Đồng mới bao gồm:</h3>
            <ul>
              <li><strong>Vùng Cao nguyên Lâm Đồng</strong> (Lâm Đồng cũ) - Trung tâm hành chính: Đà Lạt</li>
              <li><strong>Vùng Duyên hải Nam Trung Bộ</strong> (Bình Thuận) - Trung tâm phụ: Phan Thiết</li>
              <li><strong>Vùng Tây Nguyên Đông</strong> (Đắk Nông) - Trung tâm phụ: Gia Nghĩa</li>
            </ul>
          </div>
        </div>

        <div class="history-section">
          <h2>📚 Bối cảnh lịch sử</h2>
          
          <h3>Lâm Đồng cũ (1975-2025)</h3>
          <p>Tỉnh Lâm Đồng được thành lập năm 1975 sau thống nhất đất nước, với diện tích 9.773,5 km² và dân số khoảng 1,3 triệu người. Được biết đến như "thành phố ngàn hoa" với khí hậu ôn hòa quanh năm.</p>
          
          <h3>Bình Thuận - Di sản Champa</h3>
          <p>Với lịch sử hơn 300 năm, Bình Thuận mang trong mình văn hóa Chăm Pa đặc sắc. Diện tích 7.812,9 km² với dân số 1,2 triệu người, nổi tiếng với tháp Chăm Po Shanu và các làng chài truyền thống.</p>
          
          <h3>Đắk Nông - Vùng đất Bazan màu mỡ</h3>
          <p>Tách ra từ Đắk Lăk năm 2004, Đắk Nông có diện tích 6.515,6 km² với 600.000 dân. Nổi tiếng với công viên địa chất toàn cầu và văn hóa các dân tộc thiểu số.</p>
        </div>

        <div class="merger-section">
          <h2>🤝 Quá trình sát nhập (2024-2025)</h2>
          
          <div class="timeline">
            <div class="timeline-item">
              <h4>Tháng 3/2024</h4>
              <p>Quốc hội thông qua Nghị quyết về việc sát nhập 3 tỉnh nhằm tạo ra đơn vị hành chính có sức mạnh kinh tế và địa lý chiến lược.</p>
            </div>
            
            <div class="timeline-item">
              <h4>Tháng 8/2024</h4>
              <p>Thành lập Ban chỉ đạo sát nhập với sự tham gia của lãnh đạo 3 tỉnh và các chuyên gia.</p>
            </div>
            
            <div class="timeline-item">
              <h4>Tháng 1/2025</h4>
              <p>Chính thức thành lập tỉnh Lâm Đồng mới với diện tích 24.101 km² và dân số 3,1 triệu người.</p>
            </div>
          </div>
        </div>

        <div class="benefits-section">
          <h2>🎯 Lợi ích của việc sát nhập</h2>
          
          <div class="benefits-grid">
            <div class="benefit-item">
              <h4>🏛️ Hành chính</h4>
              <p>Tối ưu hóa bộ máy, giảm chi phí quản lý, tăng hiệu quả điều hành.</p>
            </div>
            
            <div class="benefit-item">
              <h4>💰 Kinh tế</h4>
              <p>Kết nối du lịch cao nguyên - biển, phát triển logistics, nông nghiệp công nghệ cao.</p>
            </div>
            
            <div class="benefit-item">
              <h4>🌍 Địa lý</h4>
              <p>Tạo ra tỉnh có vị trí chiến lược từ cao nguyên đến biển, thuận lợi giao thương.</p>
            </div>
            
            <div class="benefit-item">
              <h4>🎭 Văn hóa</h4>
              <p>Bảo tồn và phát huy đa dạng văn hóa: Kinh, Chăm, các dân tộc thiểu số.</p>
            </div>
          </div>
        </div>

        <div class="new-structure-section">
          <h2>🗺️ Cơ cấu hành chính mới</h2>
          
          <h3>Trung tâm hành chính chính: Đà Lạt</h3>
          <p>Thành phố Đà Lạt tiếp tục là trung tâm chính trị, hành chính của tỉnh mới.</p>
          
          <h3>Các trung tâm phụ:</h3>
          <ul>
            <li><strong>Phan Thiết</strong>: Trung tâm kinh tế biển, du lịch nghỉ dưỡng</li>
            <li><strong>Gia Nghĩa</strong>: Trung tâm nông lâm nghiệp, công nghiệp chế biến</li>
          </ul>
          
          <h3>Phân vùng phát triển:</h3>
          <ul>
            <li><strong>Vùng 1 - Cao nguyên Lâm Đồng</strong>: Du lịch, nông nghiệp công nghệ cao</li>
            <li><strong>Vùng 2 - Duyên hải Bình Thuận</strong>: Năng lượng tái tạo, logistics biển</li>
            <li><strong>Vùng 3 - Tây Nguyên Đắk Nông</strong>: Khai khoáng, nông lâm sản</li>
          </ul>
        </div>

        <div class="conclusion-section">
          <h2>🔮 Tầm nhìn tương lai</h2>
          <p>Tỉnh Lâm Đồng mới hướng tới trở thành:</p>
          <ul>
            <li>🏆 <strong>Trung tâm Du lịch hàng đầu Đông Nam Á</strong> với chuỗi sản phẩm từ cao nguyên đến biển</li>
            <li>🌱 <strong>Vùng nông nghiệp công nghệ cao</strong> với sản phẩm sạch, hữu cơ</li>
            <li>⚡ <strong>Trung tâm năng lượng tái tạo</strong> của cả nước</li>
            <li>🏭 <strong>Cửa ngõ logistics</strong> kết nối Tây Nguyên với biển Đông</li>
          </ul>
          
          <div class="quote-box">
            <p><em>"Lâm Đồng mới không chỉ là sự kết hợp của ba vùng đất, mà là sự hòa quyện của ba nền văn hóa, ba thế mạnh kinh tế để cùng nhau xây dựng một tương lai thịnh vượng."</em></p>
            <cite>- Chủ tịch UBND tỉnh Lâm Đồng mới</cite>
          </div>
        </div>

        <div class="quiz-section">
          <h2>📝 Câu hỏi ôn tập</h2>
          <ol>
            <li>Tỉnh Lâm Đồng mới được thành lập từ việc sát nhập những tỉnh nào?</li>
            <li>Trung tâm hành chính chính của tỉnh Lâm Đồng mới là thành phố nào?</li>
            <li>Nêu 3 lợi ích chính của việc sát nhập này?</li>
            <li>Tỉnh Lâm Đồng mới có diện tích và dân số là bao nhiêu?</li>
          </ol>
        </div>
      </div>
    `,
    isPublished: true,
    createdAt: '2025-01-15',
    updatedAt: '2025-09-20'
  },
  
  {
    id: 2,
    title: 'Địa lý và khí hậu đa dạng của Lâm Đồng mới',
    slug: 'dia-ly-khi-hau-da-dang-lam-dong-moi',
    summary: 'Khám phá sự đa dạng địa lý từ cao nguyên Đà Lạt, đồng bằng ven biển Phan Thiết đến cao nguyên Đắk Nông.',
    description: 'Tìm hiểu về đặc điểm địa lý, khí hậu độc đáo của tỉnh Lâm Đồng mới với 3 vùng sinh thái khác biệt.',
    instructor: 'PGS.TS Trần Thị Lan Hương',
    duration: '50 phút',
    difficulty: 'Trung bình',
    rating: 4.8,
    students: 287,
    progress: 0,
    category: 'Địa lý',
    tags: ['Địa lý', 'Khí hậu', 'Sinh thái', 'Đa dạng'],
    status: 'Chưa học',
    contentHtml: `
      <div class="lesson-content">
        <h1>Địa lý và khí hậu đa dạng của Lâm Đồng mới</h1>
        
        <div class="intro-section">
          <h2>🌍 Tổng quan địa lý</h2>
          <p>Tỉnh Lâm Đồng mới với diện tích <strong>24.101 km²</strong> trải dài từ cao nguyên đến biển, tạo nên một bức tranh địa lý đa dạng và phong phú.</p>
          
          <div class="stats-grid">
            <div class="stat-item">
              <h4>📏 Diện tích</h4>
              <p>24.101 km²</p>
            </div>
            <div class="stat-item">
              <h4>👥 Dân số</h4>
              <p>3,1 triệu người</p>
            </div>
            <div class="stat-item">
              <h4>🏔️ Độ cao</h4>
              <p>0 - 2.167m</p>
            </div>
            <div class="stat-item">
              <h4>🌊 Bờ biển</h4>
              <p>192 km</p>
            </div>
          </div>
        </div>

        <div class="regions-section">
          <h2>🗺️ Ba vùng địa lý chính</h2>
          
          <div class="region-detail">
            <h3>1. 🏔️ Vùng Cao nguyên Lâm Đồng (Phía Bắc)</h3>
            <div class="region-content">
              <h4>Đặc điểm địa hình:</h4>
              <ul>
                <li>Cao độ trung bình: 800-1.500m</li>
                <li>Đỉnh cao nhất: Bidoup (2.167m)</li>
                <li>Địa hình đồi núi, cao nguyên xen kẽ thung lũng</li>
                <li>Nhiều hồ tự nhiên và nhân tạo</li>
              </ul>
              
              <h4>Khí hậu:</h4>
              <ul>
                <li>Khí hậu cận nhiệt đới ẩm</li>
                <li>Nhiệt độ trung bình: 18-22°C</li>
                <li>Mùa khô: 12-4, mùa mưa: 5-11</li>
                <li>Lượng mưa: 1.500-2.500mm/năm</li>
              </ul>
            </div>
          </div>
          
          <div class="region-detail">
            <h3>2. 🏖️ Vùng Duyên hải Bình Thuận (Phía Đông)</h3>
            <div class="region-content">
              <h4>Đặc điểm địa hình:</h4>
              <ul>
                <li>Đồng bằng ven biển rộng lớn</li>
                <li>Hệ thống cồn cát di động</li>
                <li>Bờ biển dài 192km với nhiều vịnh đẹp</li>
                <li>Núi Tà Cú cao 649m</li>
              </ul>
              
              <h4>Khí hậu:</h4>
              <ul>
                <li>Khí hậu nhiệt đới khô hạn</li>
                <li>Nhiệt độ trung bình: 26-28°C</li>
                <li>Mùa khô kéo dài: 11-4</li>
                <li>Lượng mưa: 800-1.200mm/năm</li>
              </ul>
            </div>
          </div>
          
          <div class="region-detail">
            <h3>3. 🌲 Vùng Tây Nguyên Đắk Nông (Phía Tây)</h3>
            <div class="region-content">
              <h4>Đặc điểm địa hình:</h4>
              <ul>
                <li>Cao nguyên Buôn Ma Thuột mở rộng</li>
                <li>Cao độ trung bình: 400-800m</li>
                <li>Đất bazan màu mỡ</li>
                <li>Nhiều thác nước và hang động</li>
              </ul>
              
              <h4>Khí hậu:</h4>
              <ul>
                <li>Khí hậu nhiệt đới gió mùa</li>
                <li>Nhiệt độ trung bình: 23-25°C</li>
                <li>Mùa khô: 12-4, mùa mưa: 5-11</li>
                <li>Lượng mưa: 1.600-2.000mm/năm</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="climate-diversity-section">
          <h2>🌡️ Sự đa dạng khí hậu</h2>
          
          <div class="climate-map">
            <h3>Phân vùng khí hậu:</h3>
            <div class="climate-zones">
              <div class="zone">
                <h4>🌨️ Vùng khí hậu ôn hòa (Đà Lạt)</h4>
                <p>Quanh năm mát mẻ, ít biến đổi theo mùa. Thích hợp trồng hoa, rau ôn đới.</p>
              </div>
              
              <div class="zone">
                <h4>☀️ Vùng khí hậu khô nóng (Phan Thiết)</h4>
                <p>Nắng nhiều, gió Lào mạnh. Phù hợp nuôi trồng thủy sản, năng lượng mặt trời.</p>
              </div>
              
              <div class="zone">
                <h4>🌧️ Vùng khí hậu nhiệt đới (Gia Nghĩa)</h4>
                <p>Mưa nhiều, ẩm ướt. Thuận lợi trồng cà phê, hồ tiêu, cao su.</p>
              </div>
            </div>
          </div>
          
          <h3>Ưu điểm của sự đa dạng khí hậu:</h3>
          <ul>
            <li>🌾 <strong>Nông nghiệp đa dạng</strong>: Từ hoa màu ôn đới đến cây nhiệt đới</li>
            <li>🏖️ <strong>Du lịch 4 mùa</strong>: Cao nguyên mát mẻ, biển ấm áp</li>
            <li>⚡ <strong>Năng lượng tái tạo</strong>: Gió, mặt trời, thủy điện</li>
            <li>🐟 <strong>Thủy sản phong phú</strong>: Từ ao hồ cao nguyên đến biển cả</li>
          </ul>
        </div>

        <div class="natural-resources-section">
          <h2>⛏️ Tài nguyên thiên nhiên</h2>
          
          <div class="resources-grid">
            <div class="resource-category">
              <h4>💎 Khoáng sản</h4>
              <ul>
                <li>Bauxite (Đắk Nông)</li>
                <li>Titan (Bình Thuận)</li>
                <li>Đất hiếm (Lâm Đồng)</li>
                <li>Cát thạch anh (Bình Thuận)</li>
              </ul>
            </div>
            
            <div class="resource-category">
              <h4>🌊 Tài nguyên nước</h4>
              <ul>
                <li>Hệ thống sông Đồng Nai</li>
                <li>Hồ Dầu Tiếng, hồ Trị An</li>
                <li>Nước ngầm phong phú</li>
                <li>Suối nước nóng Bình Châu</li>
              </ul>
            </div>
            
            <div class="resource-category">
              <h4>🌲 Tài nguyên rừng</h4>
              <ul>
                <li>Rừng thông Đà Lạt</li>
                <li>Rừng nguyên sinh Tây Nguyên</li>
                <li>Độ che phủ: 45% diện tích</li>
                <li>Đa dạng sinh học cao</li>
              </ul>
            </div>
            
            <div class="resource-category">
              <h4>🏖️ Tài nguyên biển</h4>
              <ul>
                <li>Bờ biển 192km</li>
                <li>Nhiều vịnh, cửa sông</li>
                <li>Hải sản phong phú</li>
                <li>Cảnh quan du lịch đẹp</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="challenges-section">
          <h2>⚠️ Thách thức từ đa dạng địa lý</h2>
          
          <h3>1. Quản lý đa vùng sinh thái</h3>
          <ul>
            <li>Khác biệt lớn về khí hậu, địa hình</li>
            <li>Cần chính sách phát triển phù hợp từng vùng</li>
            <li>Đảm bảo cân bằng sinh thái</li>
          </ul>
          
          <h3>2. Kết nối giao thông</h3>
          <ul>
            <li>Địa hình phức tạp, chi phí xây dựng cao</li>
            <li>Cần hệ thống giao thông đồng bộ</li>
            <li>Khai thác tiềm năng logistics</li>
          </ul>
          
          <h3>3. Biến đổi khí hậu</h3>
          <ul>
            <li>Hạn hán ở vùng ven biển</li>
            <li>Lũ lụt ở vùng cao nguyên</li>
            <li>Xâm nhập mặn ven biển</li>
          </ul>
        </div>

        <div class="opportunities-section">
          <h2>🚀 Cơ hội phát triển</h2>
          
          <div class="opportunity-item">
            <h4>🏝️ Du lịch đa trải nghiệm</h4>
            <p>Kết hợp du lịch cao nguyên - biển - sinh thái trong một hành trình</p>
          </div>
          
          <div class="opportunity-item">
            <h4>🌾 Nông nghiệp công nghệ cao</h4>
            <p>Tận dụng khí hậu đa dạng để phát triển nông sản chất lượng cao</p>
          </div>
          
          <div class="opportunity-item">
            <h4>⚡ Năng lượng xanh</h4>
            <p>Phát triển điện gió, điện mặt trời, thủy điện nhỏ</p>
          </div>
          
          <div class="opportunity-item">
            <h4>🚢 Cửa ngõ logistics</h4>
            <p>Kết nối Tây Nguyên với cảng biển, xuất khẩu nông sản</p>
          </div>
        </div>

        <div class="conclusion-section">
          <h2>📝 Kết luận</h2>
          <p>Sự đa dạng địa lý và khí hậu của tỉnh Lâm Đồng mới vừa là thách thức vừa là cơ hội lớn. Việc khai thác hợp lý và bền vững những lợi thế này sẽ giúp tỉnh phát triển toàn diện, trở thành một trong những tỉnh phát triển nhất cả nước.</p>
          
          <div class="key-points">
            <h4>🔑 Điểm quan trọng cần nhớ:</h4>
            <ul>
              <li>Ba vùng sinh thái: Cao nguyên - Ven biển - Tây Nguyên</li>
              <li>Khí hậu từ ôn hòa đến nhiệt đới khô hạn</li>
              <li>Tài nguyên thiên nhiên đa dạng và phong phú</li>
              <li>Tiềm năng phát triển bền vững cao</li>
            </ul>
          </div>
        </div>

        <div class="quiz-section">
          <h2>📝 Câu hỏi ôn tập</h2>
          <ol>
            <li>Tỉnh Lâm Đồng mới có diện tích bao nhiêu và gồm những vùng địa lý nào?</li>
            <li>So sánh khí hậu của 3 vùng chính trong tỉnh Lâm Đồng mới.</li>
            <li>Nêu các loại tài nguyên thiên nhiên chính của tỉnh.</li>
            <li>Phân tích ưu điểm và thách thức từ sự đa dạng địa lý.</li>
            <li>Đề xuất hướng phát triển phù hợp cho từng vùng sinh thái.</li>
          </ol>
        </div>
      </div>
    `,
    isPublished: true,
    createdAt: '2025-02-10',
    updatedAt: '2025-09-18'
  },

  {
    id: 3,
    title: 'Văn hóa đa sắc tộc trong Lâm Đồng mới',
    slug: 'van-hoa-da-sac-toc-lam-dong-moi',
    summary: 'Khám phá sự hòa quyện văn hóa Kinh, Chăm, K\'Ho, Churu, Ê Đê và các dân tộc khác trong không gian Lâm Đồng mới.',
    description: 'Tìm hiểu về bức tranh văn hóa đa sắc màu với hơn 20 dân tộc cùng chung sống và phát triển.',
    instructor: 'TS. Lê Văn Thành',
    duration: '55 phút',
    difficulty: 'Nâng cao',
    rating: 4.9,
    students: 198,
    progress: 0,
    category: 'Văn hóa',
    tags: ['Văn hóa', 'Dân tộc', 'Truyền thống', 'Đa dạng'],
    status: 'Chưa học',
    contentHtml: `
      <div class="lesson-content">
        <h1>Văn hóa đa sắc tộc trong Lâm Đồng mới</h1>
        
        <div class="intro-section">
          <h2>🌈 Bức tranh văn hóa đa sắc</h2>
          <p>Tỉnh Lâm Đồng mới là nơi hội tụ của <strong>hơn 20 dân tộc</strong>, tạo nên một bức tranh văn hóa phong phú và đa dạng. Từ văn hóa Kinh chủ đạo đến những nét văn hóa độc đáo của các dân tộc thiểu số, tất cả đã hòa quyện tạo nên bản sắc văn hóa riêng biệt.</p>
          
          <div class="diversity-stats">
            <div class="stat-box">
              <h4>👥 Dân tộc Kinh</h4>
              <p>75% dân số (2,3 triệu người)</p>
            </div>
            <div class="stat-box">
              <h4>🏕️ Dân tộc thiểu số</h4>
              <p>25% dân số (800.000 người)</p>
            </div>
            <div class="stat-box">
              <h4>🌍 Tổng số dân tộc</h4>
              <p>Hơn 20 dân tộc</p>
            </div>
          </div>
        </div>

        <div class="ethnic-groups-section">
          <h2>👑 Các dân tộc chủ yếu</h2>
          
          <div class="ethnic-group">
            <h3>🏛️ Dân tộc Kinh (Việt)</h3>
            <div class="group-content">
              <h4>Phân bố:</h4>
              <ul>
                <li>Tập trung chủ yếu ở đô thị và vùng đồng bằng</li>
                <li>Phổ biến nhất ở Đà Lạt, Phan Thiết, Gia Nghĩa</li>
                <li>Nhiều nhóm di cư từ các tỉnh Bắc - Trung - Nam</li>
              </ul>
              
              <h4>Đặc trưng văn hóa:</h4>
              <ul>
                <li>Tín ngưỡng thờ cúng tổ tiên</li>
                <li>Lễ hội truyền thống: Tết Nguyên Đán, Rằm Trung Thu</li>
                <li>Nghệ thuật: Ca Huế, Cải lương, Dân ca Nam Bộ</li>
                <li>Ẩm thực đa dạng theo vùng miền</li>
              </ul>
            </div>
          </div>
          
          <div class="ethnic-group">
            <h3>🏺 Dân tộc Chăm</h3>
            <div class="group-content">
              <h4>Phân bố:</h4>
              <ul>
                <li>Chủ yếu ở vùng Bình Thuận (cũ)</li>
                <li>Tập trung tại Phan Thiết, Phan Rang</li>
                <li>Khoảng 200.000 người</li>
              </ul>
              
              <h4>Đặc trưng văn hóa:</h4>
              <ul>
                <li>Tôn giáo: Hồi giáo Chăm và Brahmanism</li>
                <li>Kiến trúc: Tháp Chăm cổ (Po Shanu, Po Klong Garai)</li>
                <li>Nghệ thuật: Múa Apsara, nhạc cụ truyền thống</li>
                <li>Lễ hội: Kate, Bon Chol Phchum Ben</li>
                <li>Thủ công: Dệt thổ cẩm, gốm sứ</li>
              </ul>
            </div>
          </div>
          
          <div class="ethnic-group">
            <h3>🏔️ Dân tộc K'Ho</h3>
            <div class="group-content">
              <h4>Phân bố:</h4>
              <ul>
                <li>Bản địa của cao nguyên Lâm Đồng</li>
                <li>Khoảng 150.000 người</li>
                <li>Sống chủ yếu ở vùng núi cao</li>
              </ul>
              
              <h4>Đặc trưng văn hóa:</h4>
              <ul>
                <li>Tín ngưỡng: Thờ thần rừng, thần nước</li>
                <li>Nhà dài truyền thống</li>
                <li>Lễ hội: Lễ cúng rừng, lễ cúng lúa mới</li>
                <li>Nghệ thuật: Đàn K'lông Pút, điệu múa xòe</li>
                <li>Nghề truyền thống: Dệt, làm rượu cần</li>
              </ul>
            </div>
          </div>
          
          <div class="ethnic-group">
            <h3>🌾 Dân tộc Churu</h3>
            <div class="group-content">
              <h4>Phân bố:</h4>
              <ul>
                <li>Vùng Lâm Đồng cũ và Bình Thuận</li>
                <li>Khoảng 18.000 người</li>
                <li>Sống gần các dòng suối</li>
              </ul>
              
              <h4>Đặc trưng văn hóa:</h4>
              <ul>
                <li>Xã hội mẫu hệ</li>
                <li>Nhà dài truyền thống</li>
                <li>Nghệ thuật múa, hát dân gian</li>
                <li>Lễ hội mùa màng</li>
              </ul>
            </div>
          </div>
          
          <div class="ethnic-group">
            <h3>🐘 Dân tộc Ê Đê</h3>
            <div class="group-content">
              <h4>Phân bố:</h4>
              <ul>
                <li>Chủ yếu ở vùng Đắk Nông (cũ)</li>
                <li>Khoảng 100.000 người</li>
                <li>Sống ở cao nguyên bazan</li>
              </ul>
              
              <h4>Đặc trưng văn hóa:</h4>
              <ul>
                <li>Xã hội mẫu hệ</li>
                <li>Nhà dài trên cọc</li>
                <li>Lễ hội Bon Chol Dalêk</li>
                <li>Nhạc cụ: Đàn gong, đàn T'rưng</li>
                <li>Nghề: Dệt thổ cẩm, điêu khắc</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="cultural-fusion-section">
          <h2>🤝 Sự hòa quyện văn hóa</h2>
          
          <h3>1. Trong ẩm thực</h3>
          <div class="fusion-examples">
            <div class="fusion-item">
              <h4>🍲 Món ăn fusion</h4>
              <ul>
                <li><strong>Bánh căn Chăm-Kinh</strong>: Kết hợp gia vị Chăm với kỹ thuật Kinh</li>
                <li><strong>Cà ri K'Ho</strong>: Cà ri Ấn Độ pha chế theo khẩu vị bản địa</li>
                <li><strong>Rượu cần Tây Nguyên</strong>: Được người Kinh cải tiến thành rượu cao cấp</li>
              </ul>
            </div>
          </div>
          
          <h3>2. Trong lễ hội</h3>
          <div class="fusion-examples">
            <div class="fusion-item">
              <h4>🎭 Lễ hội chung</h4>
              <ul>
                <li><strong>Festival Hoa Đà Lạt</strong>: Kết hợp yếu tố Kinh-K'Ho-Churu</li>
                <li><strong>Lễ hội Chăm Pa</strong>: Thu hút du khách Kinh tham gia</li>
                <li><strong>Gala Cà phê Buôn Ma Thuột</strong>: Hòa quyện văn hóa Tây Nguyên</li>
              </ul>
            </div>
          </div>
          
          <h3>3. Trong nghệ thuật</h3>
          <div class="fusion-examples">
            <div class="fusion-item">
              <h4>🎵 Âm nhạc đương đại</h4>
              <ul>
                <li>Nhạc pop-folk kết hợp gông Tây Nguyên</li>
                <li>Fusion dance Chăm-hiện đại</li>
                <li>Thời trang dân tộc đương đại</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="languages-section">
          <h2>🗣️ Đa dạng ngôn ngữ</h2>
          
          <div class="language-groups">
            <div class="language-group">
              <h4>Nhóm ngôn ngữ Nam Á</h4>
              <ul>
                <li><strong>Tiếng Việt</strong>: Ngôn ngữ chính thức</li>
                <li><strong>Tiếng K'Ho</strong>: 5 phương ngữ chính</li>
                <li><strong>Tiếng Churu</strong>: Gần với K'Ho</li>
              </ul>
            </div>
            
            <div class="language-group">
              <h4>Nhóm ngôn ngữ Nam Đảo</h4>
              <ul>
                <li><strong>Tiếng Chăm</strong>: Chữ viết riêng (Akhar Thrah)</li>
                <li><strong>Tiếng Ê Đê</strong>: Thuộc nhóng Malayo-Polynesia</li>
              </ul>
            </div>
          </div>
          
          <div class="language-preservation">
            <h3>🔒 Bảo tồn ngôn ngữ</h3>
            <ul>
              <li>Dạy song ngữ trong trường học</li>
              <li>Phát thanh đa ngôn ngữ</li>
              <li>Số hóa tài liệu văn hóa</li>
              <li>Đào tạo thông dịch viên</li>
            </ul>
          </div>
        </div>

        <div class="cultural-heritage-section">
          <h2>🏛️ Di sản văn hóa</h2>
          
          <h3>Di sản vật thể</h3>
          <div class="heritage-grid">
            <div class="heritage-item">
              <h4>🏗️ Kiến trúc</h4>
              <ul>
                <li>Tháp Chăm Po Shanu, Po Klong Garai</li>
                <li>Nhà dài K'Ho, Ê Đê</li>
                <li>Villa Pháp cổ ở Đà Lạt</li>
                <li>Lăng Ông Phan Thiết</li>
              </ul>
            </div>
            
            <div class="heritage-item">
              <h4>🎨 Thủ công mỹ nghệ</h4>
              <ul>
                <li>Thổ cẩm Churu, K'Ho</li>
                <li>Gốm Chăm Bàu Trúc</li>
                <li>Điêu khắc gỗ Ê Đê</li>
                <li>Đan lát K'Ho</li>
              </ul>
            </div>
          </div>
          
          <h3>Di sản phi vật thể</h3>
          <div class="heritage-grid">
            <div class="heritage-item">
              <h4>🎭 Biểu diễn nghệ thuật</h4>
              <ul>
                <li>Epic Đăm San (K'Ho) - UNESCO công nhận</li>
                <li>Múa Apsara (Chăm)</li>
                <li>Lễ hội Kate (Chăm)</li>
                <li>Tín ngưỡng thờ Bà Po Ino Nagar</li>
              </ul>
            </div>
            
            <div class="heritage-item">
              <h4>🎵 Âm nhạc dân gian</h4>
              <ul>
                <li>Không gian văn hóa cồng chiêng Tây Nguyên</li>
                <li>Dân ca K'Ho</li>
                <li>Nhạc cung đình Chăm</li>
                <li>Ca khúc lao động các dân tộc</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="cultural-preservation-section">
          <h2>🛡️ Bảo tồn và phát huy văn hóa</h2>
          
          <h3>Chính sách bảo tồn</h3>
          <div class="policy-grid">
            <div class="policy-item">
              <h4>📚 Giáo dục</h4>
              <ul>
                <li>Đưa văn hóa dân tộc vào chương trình học</li>
                <li>Đào tạo nghệ nhân trẻ</li>
                <li>Xây dựng bảo tàng dân tộc học</li>
              </ul>
            </div>
            
            <div class="policy-item">
              <h4>📱 Công nghệ</h4>
              <ul>
                <li>Số hóa tài liệu văn hóa</li>
                <li>Ứng dụng VR/AR trải nghiệm văn hóa</li>
                <li>Mạng xã hội bảo tồn ngôn ngữ</li>
              </ul>
            </div>
            
            <div class="policy-item">
              <h4>🏪 Kinh tế</h4>
              <ul>
                <li>Phát triển du lịch văn hóa</li>
                <li>Thương mại hóa sản phẩm thủ công</li>
                <li>Bảo hộ thương hiệu văn hóa</li>
              </ul>
            </div>
          </div>
          
          <h3>Thách thức và giải pháp</h3>
          <div class="challenges-solutions">
            <div class="challenge-item">
              <h4>⚠️ Thách thức</h4>
              <ul>
                <li>Già hóa nghệ nhân truyền thống</li>
                <li>Tác động của văn hóa toàn cầu</li>
                <li>Đô thị hóa làm mai một văn hóa</li>
                <li>Khó khăn trong giao tiếp đa ngôn ngữ</li>
              </ul>
            </div>
            
            <div class="solution-item">
              <h4>✅ Giải pháp</h4>
              <ul>
                <li>Chương trình "Nghệ nhân trẻ"</li>
                <li>Festival văn hóa thường niên</li>
                <li>Làng văn hóa - du lịch cộng đồng</li>
                <li>Trung tâm dịch thuật đa ngôn ngữ</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="future-vision-section">
          <h2>🔮 Tầm nhìn tương lai</h2>
          
          <h3>"Lâm Đồng mới - Điểm đến văn hóa đa sắc tộc"</h3>
          <div class="vision-points">
            <div class="vision-item">
              <h4>🌍 Trung tâm văn hóa Đông Nam Á</h4>
              <p>Trở thành điểm giao lưu văn hóa quốc tế với các lễ hội, sự kiện văn hóa lớn</p>
            </div>
            
            <div class="vision-item">
              <h4>🎓 Trường đại học văn hóa đa dân tộc</h4>
              <p>Đào tạo chuyên gia về văn hóa học, nhân học, ngôn ngữ học</p>
            </div>
            
            <div class="vision-item">
              <h4>🏛️ Làng văn hóa thế giới</h4>
              <p>Xây dựng khu du lịch trải nghiệm văn hóa sống động</p>
            </div>
            
            <div class="vision-item">
              <h4>📚 Thư viện kỹ thuật số đa ngôn ngữ</h4>
              <p>Lưu trữ và chia sẻ toàn bộ kho tàng văn hóa dân tộc</p>
            </div>
          </div>
        </div>

        <div class="conclusion-section">
          <h2>🎯 Kết luận</h2>
          <p>Văn hóa đa sắc tộc của Lâm Đồng mới không chỉ là tài sản quý báu cần được bảo tồn, mà còn là động lực mạnh mẽ thúc đẩy sự phát triển kinh tế - xã hội. Sự hòa quyện và tôn trọng lẫn nhau giữa các dân tộc đã tạo nên một xã hội đa văn hóa hài hòa, trở thành mô hình điển hình cho cả nước.</p>
          
          <div class="key-messages">
            <h4>💡 Thông điệp chính:</h4>
            <ul>
              <li><strong>Đa dạng trong thống nhất:</strong> Nhiều dân tộc, một tỉnh Lâm Đồng</li>
              <li><strong>Bảo tồn trong phát triển:</strong> Giữ gìn bản sắc, hướng tới hiện đại</li>
              <li><strong>Hòa quyện trong tôn trọng:</strong> Học hỏi và chia sẻ văn hóa</li>
              <li><strong>Kế thừa trong sáng tạo:</strong> Truyền thống kết hợp đương đại</li>
            </ul>
          </div>
        </div>

        <div class="quiz-section">
          <h2>📝 Câu hỏi ôn tập</h2>
          <ol>
            <li>Kể tên 5 dân tộc chính sinh sống trong tỉnh Lâm Đồng mới và đặc trưng văn hóa của mỗi dân tộc.</li>
            <li>Phân tích sự hòa quyện văn hóa giữa các dân tộc qua ẩm thực và lễ hội.</li>
            <li>Nêu các di sản văn hóa UNESCO đã và có thể được công nhận ở Lâm Đồng mới.</li>
            <li>Đánh giá thách thức và giải pháp trong việc bảo tồn văn hóa dân tộc thiểu số.</li>
            <li>Đề xuất kế hoạch phát triển du lịch văn hóa đa sắc tộc cho tỉnh Lâm Đồng mới.</li>
          </ol>
        </div>
      </div>
    `
  }
];

export default lessonsData;