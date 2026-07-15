set(nsgl_context "${GLFW_SOURCE_DIR}/src/nsgl_context.m")
file(READ "${nsgl_context}" source)

if(source MATCHES "SKYREWIND_EDR_FLOAT_FRAMEBUFFER")
  return()
endif()

set(original [=[
        int colorBits = fbconfig->redBits +
                        fbconfig->greenBits +
                        fbconfig->blueBits;

        // macOS needs non-zero color size, so set reasonable values
        if (colorBits == 0)
            colorBits = 24;
        else if (colorBits < 15)
            colorBits = 15;

        SET_ATTRIB(NSOpenGLPFAColorSize, colorBits);
]=])

set(replacement [=[
        // SKYREWIND_EDR_FLOAT_FRAMEBUFFER
        const GLFWbool colorFloat = fbconfig->redBits == 16 &&
                                    fbconfig->greenBits == 16 &&
                                    fbconfig->blueBits == 16 &&
                                    fbconfig->alphaBits == 16;
        if (colorFloat)
        {
            ADD_ATTRIB(NSOpenGLPFAColorFloat);
            SET_ATTRIB(NSOpenGLPFAColorSize, 64);
        }
        else
        {
            int colorBits = fbconfig->redBits +
                            fbconfig->greenBits +
                            fbconfig->blueBits;

            // macOS needs non-zero color size, so set reasonable values
            if (colorBits == 0)
                colorBits = 24;
            else if (colorBits < 15)
                colorBits = 15;

            SET_ATTRIB(NSOpenGLPFAColorSize, colorBits);
        }
]=])

string(FIND "${source}" "${original}" match_index)
if(match_index EQUAL -1)
  message(FATAL_ERROR "Unable to apply Sky Rewind EDR patch to GLFW 3.4")
endif()

string(REPLACE "${original}" "${replacement}" source "${source}")
file(WRITE "${nsgl_context}" "${source}")
