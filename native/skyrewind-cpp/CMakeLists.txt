cmake_minimum_required(VERSION 3.24)

project(SkyRewindCpp LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

include(FetchContent)

set(GLFW_BUILD_DOCS OFF CACHE BOOL "" FORCE)
set(GLFW_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(GLFW_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(GLFW_INSTALL OFF CACHE BOOL "" FORCE)

FetchContent_Declare(
  glfw
  GIT_REPOSITORY https://github.com/glfw/glfw.git
  GIT_TAG 3.4
)
FetchContent_MakeAvailable(glfw)

FetchContent_Declare(
  imgui
  GIT_REPOSITORY https://github.com/ocornut/imgui.git
  GIT_TAG v1.90.9
)
FetchContent_MakeAvailable(imgui)

add_library(imgui STATIC
  ${imgui_SOURCE_DIR}/imgui.cpp
  ${imgui_SOURCE_DIR}/imgui_draw.cpp
  ${imgui_SOURCE_DIR}/imgui_tables.cpp
  ${imgui_SOURCE_DIR}/imgui_widgets.cpp
  ${imgui_SOURCE_DIR}/backends/imgui_impl_glfw.cpp
  ${imgui_SOURCE_DIR}/backends/imgui_impl_opengl3.cpp
)
target_include_directories(imgui PUBLIC
  ${imgui_SOURCE_DIR}
  ${imgui_SOURCE_DIR}/backends
)
target_link_libraries(imgui PUBLIC glfw)
if(APPLE)
  target_compile_options(imgui PRIVATE -Wno-nontrivial-memcall)
endif()

add_executable(skyrewind_cpp
  src/Astronomy.cpp
  src/Catalog.cpp
  src/Main.cpp
)

target_include_directories(skyrewind_cpp PRIVATE src)
target_link_libraries(skyrewind_cpp PRIVATE glfw imgui)

if(APPLE)
  target_sources(skyrewind_cpp PRIVATE src/MacDockIcon.mm)
  target_compile_definitions(skyrewind_cpp PRIVATE GL_SILENCE_DEPRECATION)
  target_compile_options(skyrewind_cpp PRIVATE -Wno-nontrivial-memcall)
  target_link_libraries(skyrewind_cpp PRIVATE "-framework Cocoa" "-framework OpenGL")
else()
  find_package(OpenGL REQUIRED)
  target_link_libraries(skyrewind_cpp PRIVATE OpenGL::GL)
endif()
